import { Directory, Paths, File } from 'expo-file-system';


const directory = new Directory(Paths.cache, "binomia");

export const useFileSystem = () => {

    const listFiles = async () => {
        try {
            if (directory.exists) {
                const files = directory.list();
                return files
            }
        } catch (error) {
            console.error('Error listing files:', error);
        }
    }

    const deleteFile = async (fileUrl: string) => {
        try {
            const file = new File(Paths.cache, "binomia", fileUrl);

            if (file.exists) {
                file.delete();
            }

        } catch (error: any) {
            console.error('Error deleting files:', error);
        }
    }

    return {
        listFiles,
        deleteFile,
        dir: directory
    }
}