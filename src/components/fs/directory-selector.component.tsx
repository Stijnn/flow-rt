import { invoke } from "@tauri-apps/api/core"
import { useEffect, useState } from "react"
import { toast } from "sonner";
import { Item, ItemHeader } from "../ui/item";
import { ChevronLeft, Folder, Home } from "lucide-react";

type DirectoryListing = {
    entries: {
        name: string;
        path: string;
        item_type: string
    }[]
};

export const DirectorySelector = ({ startDirectory }: { startDirectory?: string }) => {
    const [homeDirectory, setHomeDirectory] = useState<string | null>(null);
    const [currentDirectory, setCurrentDirectory] = useState<string | null>(null);
    const [currentDirectoryEntries, setCurrentDirectoryEntries] = useState<DirectoryListing>();

    const fetchEntries = (dir: string | null) => {
        if (!dir && dir !== "") {
            console.error("Invalid dir")
            return;
        }

        if (dir === "") {
            invoke<DirectoryListing>("list_drives", { path: dir }).then((listingResult) => {
                setCurrentDirectoryEntries({ entries: listingResult.entries.filter((e) => e.item_type === 'DIRECTORY') });
            }).catch((e) => toast.error(e)).finally()
        } else {
            invoke<DirectoryListing>("list_directory", { path: dir }).then((listingResult) => {
                setCurrentDirectoryEntries({ entries: listingResult.entries.filter((e) => e.item_type === 'DIRECTORY') });
            }).catch((e) => toast.error(e)).finally()
        }
    }

    useEffect(() => {
        console.log(currentDirectoryEntries)
    }, [currentDirectoryEntries])

    useEffect(() => {
        fetchEntries(currentDirectory)
    }, [currentDirectory])

    useEffect(() => {
        setCurrentDirectory(homeDirectory);
    }, [homeDirectory])

    useEffect(() => {
        if (startDirectory) {
            setHomeDirectory(startDirectory);
        } else {
            invoke<string>("get_home_directory")
                .then((dir) => setHomeDirectory(dir))
                .catch((e) => {
                    toast.error(e);
                })
                .finally();
        }
    }, []);

    const navigateUp = () => {
        if (!currentDirectory || currentDirectory === "/") return;
        const isWindowsRoot = /^[A-Z]:\\?$/i.test(currentDirectory);
    
        if (isWindowsRoot) {
            setCurrentDirectory("");
        } else {
            const parts = currentDirectory.split(/[/\\]/).filter(Boolean);
            parts.pop();
            
            const newPath = parts.join('\\') + "\\";
            setCurrentDirectory(newPath);
        }
    };

    return (
        <div className="flex flex-col border rounded-lg bg-card overflow-hidden m-3">
            <div className="flex items-center gap-2 p-2 bg-muted/50 border-b text-xs font-mono truncate">
                <Home size={14} />
                {currentDirectory}
            </div>

            <div className="flex flex-col max-h-[calc(100dvh-240px)] overflow-y-auto">
                <Item 
                    className="py-0 shrink-0 sticky top-0 rounded-none z-10 bg-accent" 
                    variant={"outline"} 
                    onClick={navigateUp}
                >
                    <ItemHeader className="flex items-center gap-2 py-2 cursor-pointer">
                        <ChevronLeft size={16} />
                        <span>Go one directory up</span>
                    </ItemHeader>
                </Item>

                <div className="flex flex-col p-2">
                    {currentDirectoryEntries?.entries.map((entry) => (
                        <Item 
                            key={entry.path}
                            className="py-2 border-none hover:bg-accent group transition-colors" 
                            variant={"outline"}
                            onClick={() => setCurrentDirectory(entry.path)}
                        >
                            <ItemHeader className="flex items-center gap-2 py-2 cursor-pointer">
                                <Folder size={16} />
                                {entry.name}
                            </ItemHeader>
                        </Item>
                    ))}
                    
                    {currentDirectoryEntries?.entries.length === 0 && (
                        <div className="p-10 text-center text-sm text-muted-foreground">
                            No folders found.
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}