const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const Module = require('module');

// Find the project and workspace directories
const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

// CRITICAL FIX: Make Node's require.resolve() able to find packages
// installed in apps/mobile/node_modules even when called from hoisted
// packages (like babel-preset-expo) living at the workspace root.
// Without this, babel-preset-expo's hasModule('expo-router') returns false
// and the router babel plugin is never loaded.
const localNodeModules = path.resolve(projectRoot, 'node_modules');
if (!process.env.NODE_PATH || !process.env.NODE_PATH.includes(localNodeModules)) {
  process.env.NODE_PATH = process.env.NODE_PATH
    ? `${localNodeModules}${path.delimiter}${process.env.NODE_PATH}`
    : localNodeModules;
  Module._initPaths();
}

const config = getDefaultConfig(projectRoot);

// 1. Watch all files within the monorepo
config.watchFolders = [workspaceRoot];

// 2. Let Metro know where to resolve packages and in what order
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

module.exports = config;
