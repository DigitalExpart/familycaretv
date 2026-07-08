# FamilyCare TV Roku Channel - Installation Guide

This guide explains how to install the `FamilyCareTV_Roku.zip` release candidate onto your Roku hardware for client testing.

## Prerequisites
1. A physical Roku streaming player or Roku TV.
2. A computer on the same local network as the Roku device.
3. The `FamilyCareTV_Roku.zip` archive.

## Step 1: Enable Developer Mode
1. On your Roku remote, enter the following sequence quickly:
   `Home 3x, Up 2x, Right, Left, Right, Left, Right`
2. Follow the on-screen instructions to enable installer privileges.
3. You will be prompted to set a webserver password. Write this down.
4. The screen will display an IP Address (e.g., `http://192.168.1.50`). Write this down.

## Step 2: Sideload the App
1. Open a web browser on your computer and navigate to the IP address from Step 1.
2. Log in using the username `rokudev` and the password you set.
3. Click the **Upload** button and select the `FamilyCareTV_Roku.zip` file.
4. Click **Install**.
5. The channel will automatically launch on your Roku device.

## Step 3: Troubleshooting
- **Error: Application failed to compile**: Ensure you are uploading the complete `.zip` file provided, and not an extracted folder.
- **Connection Refused**: Ensure your computer and Roku are on the exact same Wi-Fi network and that Developer Mode is still active.
