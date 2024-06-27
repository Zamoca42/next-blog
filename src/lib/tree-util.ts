import fs from "fs/promises";
import { ContentFolder } from "@/interface/folder";
import { join, relative } from "path";
import { capitalizeAfterHyphen } from "@/lib/util";
import { postsDirectory, readGitInfo } from "@/lib/file-util";
import { parsePostContent } from "@/lib/post-util";

export const getSpecificTreeNode = async (
  folderName: string
): Promise<ContentFolder[]> => {
  try {
    const specificDirectory = join(postsDirectory, folderName);
    const stat = await fs.stat(specificDirectory);

    if (!stat.isDirectory()) {
      throw new Error(`${folderName} is not a directory`);
    }

    const folders = await getTreeNode(specificDirectory);
    return [
      {
        id: "1",
        path: folderName,
        name: capitalizeAfterHyphen(folderName),
        children: folders,
      },
    ];
  } catch (error) {
    console.error(`Error getting tree nodes for ${folderName}:`, error);
    return [];
  }
};

export const getAllTreeNode = async (): Promise<ContentFolder[]> => {
  try {
    const folders = await getTreeNode(postsDirectory);
    return folders;
  } catch (error) {
    console.error("Error getting all tree nodes:", error);
    return [];
  }
};

const getTreeNode = async (
  directory: string,
  parentId: string = ""
): Promise<ContentFolder[]> => {
  try {
    const fileNames = await fs.readdir(directory);
    const gitInfo = await readGitInfo();

    fileNames.sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" })
    );

    const folders: ContentFolder[] = [];

    for (let index = 0; index < fileNames.length; index++) {
      const fileName = fileNames[index];
      const filePath = join(directory, fileName);
      const stat = await fs.stat(filePath);
      const id = `${parentId}${index + 1}`;

      if (stat.isDirectory()) {
        const children = await getTreeNode(filePath, id);
        folders.push({
          id,
          path: fileName,
          name: capitalizeAfterHyphen(fileName),
          children,
        });
      } else if (fileName.endsWith(".md")) {
        const relativeFilePath = relative(postsDirectory, filePath);
        const post = await parsePostContent(relativeFilePath, gitInfo);
        folders.push({
          id,
          path: post.slug,
          order: post.order,
          name: post.title,
          children: [],
        });
      }
    }

    return folders;
  } catch (error) {
    console.error(`Error getting tree node for directory ${directory}:`, error);
    return [];
  }
};
