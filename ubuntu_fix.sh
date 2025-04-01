# This is ment to be a fix for developers when trying to build this app
# on ubuntu for some reason in debian it works out of the box but in ubuntu
# it does not , so to be able to run the command 'npm run dev' you first
# need to run the ubuntu fix
sudo chown root:root node_modules/electron/dist/chrome-sandbox
sudo chmod 4755 node_modules/electron/dist/chrome-sandbox
