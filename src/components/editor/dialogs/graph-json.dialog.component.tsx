import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Copy } from "lucide-react";
import { toast } from "sonner";

export const GraphJsonDialog = ({ object }: { object: any }) => {
  return (
    <div className="h-[90vh] p-4 pb-14 flex flex-col space-y-3">
      <Button onClick={() => {
        navigator.clipboard.writeText(JSON.stringify(object, null, 2));
        toast.success("Copied to clipboard");
      }} className="w-fit"><Copy/> Copy to clipboard</Button>
      <ScrollArea className="h-full w-full rounded-md border">
        <Textarea
          readOnly
          className="min-h-full w-full font-mono resize-none border-none focus-visible:ring-0"
          value={JSON.stringify(object, null, 2)}
        />
      </ScrollArea>
    </div>
  );
};
