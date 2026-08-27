import type { VFSNode } from '../../types';
import { profileBio, systemInfo, projects, awards } from '../../data/profileData';

export const INITIAL_VFS: VFSNode = {
  name: '/',
  type: 'directory',
  children: {
    home: {
      name: 'home',
      type: 'directory',
      children: {
        guest: {
          name: 'guest',
          type: 'directory',
          children: {
            'about.md': {
              name: 'about.md',
              type: 'file',
              size: '1.2K',
              modifiedAt: 'Aug 27 16:30',
              content: `# ${profileBio.fullName} (@qitiya)\n${profileBio.tagline}\n\n${profileBio.fullBio.join('\n\n')}\n\nEmail: ${profileBio.socials.email}\nGitHub: ${profileBio.socials.github}`,
            },
            'awards.txt': {
              name: 'awards.txt',
              type: 'file',
              size: '950B',
              modifiedAt: 'Aug 27 21:00',
              content: `# HACKATHON CHAMPIONSHIPS & AWARDS\n\n${awards.map((a) => `- [${a.position}] ${a.title} (${a.category})\n  Organizer: ${a.event}\n  ${a.description}`).join('\n\n')}`,
            },
            'skills.txt': {
              name: 'skills.txt',
              type: 'file',
              size: '840B',
              modifiedAt: 'Aug 27 16:30',
              content: `LANGUAGES:\n- TypeScript, JavaScript, Python, C, C++, Java, Solidity, SQL\n\nFRAMEWORKS & LIBS:\n- React 19, Next.js 15, Node.js, Express, Tailwind CSS v4, Flask, Supabase\n\nDATABASES & DEVOPS:\n- PostgreSQL, MongoDB, Docker, Git, Linux, Vercel`,
            },
            'contact.sh': {
              name: 'contact.sh',
              type: 'file',
              size: '320B',
              modifiedAt: 'Aug 27 16:30',
              content: `#!/usr/bin/env bash\necho "Email: ${profileBio.socials.email}"\necho "GitHub: ${profileBio.socials.github}"\necho "LinkedIn: ${profileBio.socials.linkedin}"`,
            },
            projects: {
              name: 'projects',
              type: 'directory',
              children: Object.fromEntries(
                projects.map((p) => [
                  p.slug,
                  {
                    name: p.slug,
                    type: 'directory',
                    children: {
                      'README.md': {
                        name: 'README.md',
                        type: 'file',
                        size: '2.4K',
                        modifiedAt: 'Aug 27 16:30',
                        content: `# ${p.name}\n\n> ${p.tagline}\n\n## Overview\n${p.description}\n\n## Tech Stack\n${p.techStack.join(', ')}\n\n## Highlights\n${p.highlights.map((h) => `- ${h}`).join('\n')}\n\nGitHub: ${p.githubUrl}`,
                      },
                    },
                  },
                ])
              ),
            },
          },
        },
      },
    },
    etc: {
      name: 'etc',
      type: 'directory',
      children: {
        'os-release': {
          name: 'os-release',
          type: 'file',
          size: '210B',
          modifiedAt: 'Aug 27 16:00',
          content: `NAME="${systemInfo.osName}"\nPRETTY_NAME="${systemInfo.osName} (Human Core v2.4)"\nID=arch\nBUILD_ID=rolling\nANSI_COLOR="38;2;23;147;209"`,
        },
      },
    },
  },
};

export class VirtualFileSystem {
  private root: VFSNode;
  private currentPath: string = '/home/guest';

  constructor(initialTree: VFSNode = INITIAL_VFS) {
    this.root = initialTree;
  }

  getCurrentPath(): string {
    return this.currentPath;
  }

  getDisplayPath(): string {
    if (this.currentPath === '/home/guest') return '~';
    if (this.currentPath.startsWith('/home/guest/')) {
      return '~' + this.currentPath.substring('/home/guest'.length);
    }
    return this.currentPath;
  }

  private resolvePath(target: string): string {
    if (target === '~' || target === '') return '/home/guest';
    if (target.startsWith('~/')) return '/home/guest/' + target.slice(2);
    if (target.startsWith('/')) return target;

    const currentParts = this.currentPath.split('/').filter(Boolean);
    const targetParts = target.split('/').filter(Boolean);

    for (const part of targetParts) {
      if (part === '.') continue;
      if (part === '..') {
        currentParts.pop();
      } else {
        currentParts.push(part);
      }
    }

    return '/' + currentParts.join('/');
  }

  private getNode(path: string): VFSNode | null {
    const resolved = this.resolvePath(path);
    if (resolved === '/') return this.root;

    const parts = resolved.split('/').filter(Boolean);
    let curr: VFSNode = this.root;

    for (const part of parts) {
      if (curr.type !== 'directory' || !curr.children || !curr.children[part]) {
        return null;
      }
      curr = curr.children[part];
    }

    return curr;
  }

  changeDirectory(target: string): { success: boolean; error?: string } {
    const resolved = this.resolvePath(target);
    const node = this.getNode(resolved);

    if (!node) {
      return { success: false, error: `cd: no such file or directory: ${target}` };
    }
    if (node.type !== 'directory') {
      return { success: false, error: `cd: not a directory: ${target}` };
    }

    this.currentPath = resolved;
    return { success: true };
  }

  listFiles(path = ''): { success: boolean; files?: { name: string; isDir: boolean; size?: string }[]; error?: string } {
    const targetPath = path ? this.resolvePath(path) : this.currentPath;
    const node = this.getNode(targetPath);

    if (!node) {
      return { success: false, error: `ls: cannot access '${path}': No such file or directory` };
    }
    if (node.type !== 'directory') {
      return { success: true, files: [{ name: node.name, isDir: false, size: node.size }] };
    }

    const files = Object.values(node.children || {}).map((c) => ({
      name: c.name,
      isDir: c.type === 'directory',
      size: c.size,
    }));

    return { success: true, files };
  }

  readFile(path: string): { success: boolean; content?: string; error?: string } {
    const node = this.getNode(path);
    if (!node) {
      return { success: false, error: `cat: ${path}: No such file or directory` };
    }
    if (node.type === 'directory') {
      return { success: false, error: `cat: ${path}: Is a directory` };
    }
    return { success: true, content: node.content || '' };
  }

  renderTree(path = '', prefix = '', isLast = true): string[] {
    const targetPath = path ? this.resolvePath(path) : this.currentPath;
    const node = this.getNode(targetPath);
    if (!node || node.type !== 'directory') return [];

    const lines: string[] = [];
    const children = Object.values(node.children || {});

    children.forEach((child, index) => {
      const lastChild = index === children.length - 1;
      const branch = lastChild ? '└── ' : '├── ';
      const displayName = child.type === 'directory' ? `\x1b[1;34m${child.name}/\x1b[0m` : child.name;
      lines.push(`${prefix}${branch}${displayName}`);

      if (child.type === 'directory' && child.children) {
        const nextPrefix = prefix + (lastChild ? '    ' : '│   ');
        lines.push(...this.renderTree(targetPath + '/' + child.name, nextPrefix, lastChild));
      }
    });

    return lines;
  }
}

export const virtualFileSystem = new VirtualFileSystem();
