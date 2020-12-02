import { getWorkspace } from './config';
import { Tree } from '@angular-devkit/schematics';
import { experimental } from '@angular-devkit/core';
import { prompt } from 'inquirer';

export type WorkspaceProject = experimental.workspace.WorkspaceProject;

export type TestFramework = 'jest' | 'karma';

export function getProject(
  host: Tree,
  options: { project?: string | undefined; path?: string | undefined }
): WorkspaceProject {
  const workspace = getWorkspace(host);

  if (!options.project) {
    options.project =
      workspace.defaultProject !== undefined
        ? workspace.defaultProject
        : Object.keys(workspace.projects)[0];
  }

  return workspace.projects[options.project];
}

export function getProjectPath(
  host: Tree,
  options: { project?: string | undefined; path?: string | undefined }
) {
  const project = getProject(host, options);

  if (project.root.substr(-1) === '/') {
    project.root = project.root.substr(0, project.root.length - 1);
  }

  if (options.path === undefined) {
    const projectDirName =
      project.projectType === 'application' ? 'app' : 'lib';

    return `${project.root ? `/${project.root}` : ''}/src/${projectDirName}`;
  }

  return options.path;
}

export function isLib(
  host: Tree,
  options: { project?: string | undefined; path?: string | undefined }
) {
  const project = getProject(host, options);

  return project.projectType === 'library';
}

export function getProjetTestFramework(
  host: Tree,
  options: { project?: string | undefined; path?: string | undefined }
): TestFramework {
  const project = getProject(host, options);

  return project.architect?.test.builder.includes('jest') ? 'jest' : 'karma';
}

export async function promptForTestFramework(): Promise<TestFramework> {
  return new Promise<TestFramework>((resolve, reject) => {
    prompt({
      type: 'list',
      name: 'testFramework',
      message: `Unable to detect automatically the test framework you're using.\nPlease select one below`,
      choices: ['Jest', 'Karma'],
      default: 'Jest'
    }).then(answers => (answers.testFramework ? resolve('jest') : reject()));
  });
}
