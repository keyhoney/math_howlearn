import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export interface Column {
  id: string;
  title: string;
  summary: string;
  date: string;
  contentMdx: string;
}

const columnsDirectory = path.join(process.cwd(), 'content/columns');

export async function getColumns(): Promise<Column[]> {
  if (!fs.existsSync(columnsDirectory)) return [];
  const fileNames = fs.readdirSync(columnsDirectory);
  
  return fileNames
    .filter(fileName => fileName.endsWith('.mdx'))
    .map(fileName => {
      const id = fileName.replace(/\.mdx$/, '');
      const fullPath = path.join(columnsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const matterResult = matter(fileContents);
      
      return {
        id,
        title: matterResult.data.title,
        summary: matterResult.data.summary,
        date: matterResult.data.date,
        contentMdx: matterResult.content,
      };
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function getColumn(id: string): Promise<Column | null> {
  const fullPath = path.join(columnsDirectory, `${id}.mdx`);
  if (!fs.existsSync(fullPath)) return null;
  
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const matterResult = matter(fileContents);
  
  return {
    id,
    title: matterResult.data.title,
    summary: matterResult.data.summary,
    date: matterResult.data.date,
    contentMdx: matterResult.content,
  };
}
