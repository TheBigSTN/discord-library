# V 1

## V 1.6

### V 1.6.6

- Fixed the load events method is it loaded .map files if they existed.

### V 1.6.5

- Big update to documentation.
- Fixed the Button builder and now you realy can add 25 buttons as advertised and not 5 till discord library complains.

### V 1.6.4

- Because i do not know if I can keep the extra smart feature of only registering changed commands. I made it register all commands only if any command changed.
- Updaded the docs. By that i mean that I runned typedoc.

### V 1.6.3

- No ideea what happened with the 1.6.2 npm push but it won't let me use it.
- Apart from the version change nothing else changed.

### V 1.6.2

- Fixed a bug that rendered register commands broker.

### V 1.6.1

- Made the refresh logs not apprear if commands were not updated.
- And hopefully made it not remove all the bot commands. With smart registering.

### V 1.6.0

- Made the refresh command method smarter it now should only refresh modified commands. With the addition of the --refresh--all console flag that makes it refresh all commands. Or with the RefreshAll bot config.
- Re-fixed the optional description on command options that has to be required

## V 1.5

### V 1.5.4

- Forgot to add a build method on the ButtonBuilder and such it was unusable.
- Modified the build prop on ModalBuilder so that it does the thing the name suggests.
- At the same time made some atributes readonly to prevent them from overwritter.

### V 1.5.3

- Added some exports from the modal file. Forgot to add them.

### V 1.5.2

- You now can attach a beforeload interceptor when calling loadcommand.
- Because of it you now have to wrap the paths in [] so you can pass the callback last

### V 1.5.1

- Added a button builder.
- Added some missed exports

### V 1.5.0

- The version rewrites the old command option system making you the user control the order of options.
- The docs should have got or should get an update soon.

## V 1.4

### V 1.4.1

- Fixed some oversights like descriptions optional on command options

### V 1.4.0

- Description localizations used setNameLocalizations instead of setDescriptionLocalizations
- Added Default Command Permisions
- Added NSFW tag
- Added Contexts like if the comand is guild or groups or dm

## V 1.3

### V 1.3.1

- Fixed the issue where the program was stoped without any way of continuing

### V 1.3.0

- Moved the command Record inside the client with module Augumentation.
- Fixed a lot of bugs.
- name_localizations and description_localizations were made required my mistake.
- Added a EventFile class and loadevent method.
- If you added custom proprieties to data they were not kept.
- Added default command handling event.
- I need to rework the entire lib :(.
