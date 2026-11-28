"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import AdminDialog from "@/components/layouts/admin/shared/AdminDialog";
import MediaUpload from "@/components/shared/media/MediaUpload";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { getGraphQLErrorMessage } from "@/lib/graphql/error";
import { storageApi } from "./storage.api";

export default function AvatarDialog({ onClose }: { onClose: () => void }) {
  const user = useAuthStore((state) => state.user);
  const [url, setUrl] = useState(user?.avatar ?? "");
  const [assetId, setAssetId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const save = useMutation({
    mutationFn: () => storageApi.avatar(url || null, assetId),
    onSuccess: (avatar) => {
      const state = useAuthStore.getState();
      if (state.user && state.user.id === user?.id) state.setUser({ ...state.user, avatar });
      toast.success("Profile photo updated.");
      onClose();
    },
    onError: (error) => toast.error(getGraphQLErrorMessage(error)),
  });
  const busy = uploading || save.isPending;
  return <AdminDialog open title="Edit profile photo" description="Upload an image, enter a public HTTPS address, or choose one of your saved images."
    busy={busy} onOpenChange={(open) => { if (!open && !busy) onClose(); }}
    footer={<>
      <Button type="button" variant="outline" disabled={busy} onClick={onClose}>Cancel</Button>
      <Button type="button" disabled={uploading || (!assetId && url === (user?.avatar ?? ""))}
        busy={save.isPending} onClick={() => save.mutate()}>Save photo</Button>
    </>}>
    <MediaUpload label="Profile photo" purpose="USER_AVATAR" value={url} disabled={save.isPending}
      onUrlChange={(value) => { setUrl(value); setAssetId(null); }}
      onAsset={(asset) => { setUrl(asset.publicUrl ?? ""); setAssetId(asset.id); }}
      onRemove={() => { setUrl(""); setAssetId(null); }} onBusyChange={setUploading} />
  </AdminDialog>;
}
