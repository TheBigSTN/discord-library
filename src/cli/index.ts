#!/usr/bin/env node
import { program } from "commander";
import * as fs from "fs";
import * as path from "path";
import * as vm from "vm";

program
    .command("process <input> <output>")
    .description("Extracts loadcommands argument from the given file.")
    .action((input: string, output: string) => {
        // Ensure the paths are valid
        input = path.resolve(input);
        output = path.resolve(output);

        // Read the input file
        fs.readFile(input, "utf-8", async (err, data) => {
            if (err) {
                console.error(`Error reading file: ${err.message}`);
                return;
            }

            fs.writeFileSync(output, ""); // This clears the file

            const importMap: Record<string, string> = {}; // For aliases (like pt for path)
            const functionMap: Record<string, string> = {}; // For functions
            const botImport: Set<string> = new Set(); // Set to hold bot or similar variable
            const addedVars: Set<string> = new Set(); // To keep track of added variable names
            const importedFiles: string[] = []; // Store paths for imported files

            // Function to generate unique variable names based on the file path
            function generateVariableName(filePath: string): string {
                const name = filePath
                    .replace(/^\.\/+/, '')             // Remove leading './'
                    .split('/')                       // Split the path by slashes
                    .slice(-3)                         // Keep the last three parts
                    .join('_')                         // Join them back with underscores
                    .replace(/\..*$/, '');             // Remove file extension at the end
                return name;
            }

            // Extract imports (including aliases)
            const importRegex =
                /(const|let|var|import)\s+(\w+)\s*=\s*require\(['"]([^'"]+)['"]\)|import\s+(\w+)\s+from\s+['"]([^'"]+)['"]/g;
            let match;
            while ((match = importRegex.exec(data)) !== null) {
                const alias = match[2] || match[4];
                const moduleName = match[3] || match[5];
                importMap[alias] = moduleName;
            }

            // Extract function declarations
            const functionRegex = /function\s+(\w+)\s*\((.*?)\)\s*{([\s\S]*?)}/g;
            while ((match = functionRegex.exec(data)) !== null) {
                const functionName = match[1];
                const functionBody = match[3];
                functionMap[functionName] = functionBody;
            }

            // Find all occurrences of loadcommands(...) using a global regex
            const loadCommandsRegex = /(\w+)\s*\.?\s*loadcommands\s*\(\s*([^()]*(?:\((?:[^()]|[^()]*\([^()]*\))*\))?[^()]*)\s*\)/g;
            let loadMatch;
            const allArguments: string[] = [];

            while ((loadMatch = loadCommandsRegex.exec(data)) !== null) {
                const botVariable = loadMatch[1]; // Captures the variable before loadcommands, e.g., 'bot'
                botImport.add(botVariable); // Add to the import set
                let argument = loadMatch[2].trim(); // The arguments passed to loadcommands
                let commands: string[] = []; // Ensure commands is always an array

                try {

                    // Handle alias replacement for imported modules
                    for (const alias in importMap) {
                        const moduleName = importMap[alias];
                        // Replace the alias (e.g., pt) with the actual module (e.g., path)
                        argument = argument.replace(new RegExp(`\\b${alias}\\b`, 'g'), moduleName);
                    }

                    // Dynamically build the VM code
                    let vmCode = ``;

                    // Only add import statements for modules used inside the argument
                    const usedImports: Set<string> = new Set();
                    for (const alias in importMap) {
                        const moduleName = importMap[alias];
                        if (argument.includes(alias) || argument.includes(moduleName)) {
                            usedImports.add(moduleName);
                        }
                    }

                    // Add the necessary imports into the VM code
                    usedImports.forEach((moduleName) => {
                        vmCode += `const ${moduleName} = require('${moduleName}');\n`;
                    });

                    // Wrap the code in a function to avoid top-level return
                    vmCode += `
                        (function() {
                            return [${argument}];
                        })();
                    `;

                    // Execute the VM code inside the context with imports and other variables
                    const context: Record<string, any> = {
                        console,
                        require,
                        __dirname: path.dirname(input),
                        __filename: input
                    };
                    const script = new vm.Script(vmCode);
                    commands = script.runInNewContext(context);

                    // Push the extracted commands into the allArguments array
                    if (Array.isArray(commands)) {
                        allArguments.push(...commands);
                    } else {
                        console.error("Commands is not an array:", commands);
                    }
                } catch (error) {
                    console.error("Error processing loadcommands:", error);
                    console.log(`Argument causing the issue: ${argument}`);
                }
            }

            // Check if `bot` is exported as a named export and handle the import
            botImport.forEach((botVariable) => {
                const importStatement = output.endsWith(".ts")
                    ? `import { ${botVariable} } from "${path.relative(path.dirname(output), input).replace(/\.ts$/, "")}";\n`
                    : `const { ${botVariable} } = require("${path.relative(path.dirname(output), input).replace(/\.js$/, "")}");\n`;

                fs.appendFileSync(output, importStatement.replace(/\\/g, "/"));

                // Regex to check for the different ways of exporting `bot`
                const exportRegex = new RegExp(`export\\s+(var|let|const)\\s+${botVariable}|export\\s+\\{\\s*${botVariable}\\s*\\}\\s*`, 'g');

                // Check if the bot variable is exported in any of the valid forms
                if (!exportRegex.test(data)) {
                    console.warn(`Warning: '${botVariable}' may not be exported correctly. Check the export statement. It needs to be a named export.`);
                }
            });

            // Iterate through the commands
            for (const commandsPath of allArguments) {
                const resolvedPath = path.resolve(commandsPath); // Ensure the path is absolute

                if (fs.existsSync(resolvedPath) && fs.statSync(resolvedPath).isDirectory()) {
                    const stack = [resolvedPath]; // Use a stack to process subdirectories

                    while (stack.length > 0) {
                        const currentDir = stack.pop()!;
                        const files = fs.readdirSync(currentDir);

                        for (const file of files) {
                            const filePath = path.join(currentDir, file);
                            if (fs.statSync(filePath).isDirectory()) {
                                stack.push(filePath);
                            } else if (file.endsWith(".ts") || file.endsWith(".js")) {
                                const relativePath = "./" + path.relative(path.dirname(output), filePath).replace(/\\/g, "/");
                                const fileName = path.basename(file, path.extname(file));

                                // Ensure the file name is valid for use as a variable name
                                if (!fileName) continue; // Skip if there's no valid file name

                                // Generate unique variable name for this file
                                const varName = generateVariableName(relativePath);

                                // Skip if this variable name has already been added
                                if (addedVars.has(varName)) {
                                    continue;
                                }

                                // Add the variable name to the set
                                addedVars.add(varName);

                                // Use import or require based on file type
                                const importStatement = output.endsWith(".ts")
                                    ? `import ${varName} from "${relativePath.replace(/\.ts$/, "")}";\n`
                                    : `const ${varName} = require("${relativePath.replace(/\.js$/, "")}");\n`;

                                fs.appendFileSync(output, importStatement);

                                // Store the imported file for bot.loadcommand
                                importedFiles.push(varName);
                            }
                        }
                    }
                }
            }

            // Generate bot.loadcommand calls for all imported files
            importedFiles.forEach((varName) => {
                const loadCommandStatement = `bot.loadcommand(${varName});\n`;
                fs.appendFileSync(output, loadCommandStatement);
                console.log(`Generated loadcommand for: ${varName}`);
            });
        });
    });

program.parse(process.argv);
