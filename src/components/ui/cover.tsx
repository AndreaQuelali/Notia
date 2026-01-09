"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ImageIcon, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

const coverOptions = [
  "https://images.unsplash.com/photo-1503264116251-35a269479413?w=800",
  "https://images.unsplash.com/photo-1521747116042-5a810fda9664?w=800",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800",
];

export default function PageCover() {
  const [cover, setCover] = useState<string | null>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setCover(url);
    }
  };

  const handleRemove = () => setCover(null);

  return (
    <div className="relative w-full h-48 bg-muted flex items-center justify-center rounded-md overflow-hidden">
      {cover ? (
        <img src={cover} alt="Cover" className="w-full h-full object-cover" />
      ) : (
        <p className="text-muted-foreground">No cover</p>
      )}

      {/* Actions */}
      <div className="absolute top-2 right-2 flex gap-2">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="secondary" size="sm" className="cursor-pointer">
              <ImageIcon className="w-4 h-4 mr-1" />{" "}
              {cover ? "Change cover" : "Add cover"}
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{cover ? "Change cover" : "Add cover"}</DialogTitle>
            </DialogHeader>

            <Tabs defaultValue="gallery">
              <TabsList className="mb-4">
                <TabsTrigger value="gallery">Gallery</TabsTrigger>
                <TabsTrigger value="upload">Upload</TabsTrigger>
              </TabsList>

              {/* Gallery */}
              <TabsContent value="gallery">
                <div className="grid grid-cols-2 gap-4">
                  {coverOptions.map((url) => (
                    <img
                      key={url}
                      src={url}
                      alt="Cover option"
                      className="w-full h-28 object-cover rounded-md cursor-pointer hover:opacity-80"
                      onClick={() => setCover(url)}
                    />
                  ))}
                </div>
              </TabsContent>

              {/* Upload */}
              <TabsContent value="upload">
                <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-md p-6 cursor-pointer hover:bg-muted">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleUpload}
                  />
                  <ImageIcon className="w-6 h-6 mb-2" />
                  <span>Click to upload</span>
                </label>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>

        {cover && (
          <Button
            variant="destructive"
            size="sm"
            onClick={handleRemove}
            className="flex items-center gap-1 cursor-pointer"
          >
            <X className="w-4 h-4" /> Remove
          </Button>
        )}
      </div>
    </div>
  );
}
