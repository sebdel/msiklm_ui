# msiklm_ui
Gnome3 frontend for MSIKLM (MSI Keyboard Light Manager)

To install:
Use install.sh to compile the GSettings schema (to be done once before first run).

To run:
open a terminal, then change dir to the root directory of the repo and launch the script:

./msiklm_ui.js

or

gjs msiklm_ui.js

Adding '-s' on the command line will reapply the settings without launching the UI. Useful to reapply settings on login. For example, you can add these lines to the end of your .profile (adjust path accordingly): 

cd msiklm_ui
./msiklm_ui.js -s


