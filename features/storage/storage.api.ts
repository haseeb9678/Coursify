import { graphqlClient } from "@/lib/graphql/client";

export const purposes = ["COURSE_THUMBNAIL", "COURSE_PROMOTIONAL_VIDEO", "CATEGORY_IMAGE", "USER_AVATAR", "HERO_IMAGE", "HERO_MOBILE_IMAGE", "PROMOTIONAL_POPUP_IMAGE", "LESSON_VIDEO", "LESSON_DOCUMENT", "LESSON_RESOURCE"] as const;
export type MediaPurpose = typeof purposes[number];
export interface MediaAsset {
  id: string; originalFileName: string; mimeType: string; sizeBytes: number; purpose: MediaPurpose;
  status: "PENDING" | "READY" | "FAILED" | "ABORTED" | "DELETING" | "DELETED";
  visibility: "PUBLIC" | "PRIVATE"; publicUrl: string | null; createdAt: string;
}
export interface AdminMedia extends MediaAsset {
  uploader: string | null;
  courseScopeId?: string | null;
  attachments: { entityType: string; entityId: string }[];
}
export interface MediaOptions { enabled: boolean; maxBytes: number; extensions: string[] }
export interface UploadedPart { partNumber: number; etag: string }
export interface MediaRead { url: string; expiresAt: string | null; availableQualities?: number[] | null }
export interface MediaStats {
  enabled: boolean; storedBytes: number; publicBytes: number; privateBytes: number; reservedBytes: number;
  softLimit: number; hardLimit: number; stored: number; images: number; videos: number; documents: number;
  pending: number; failed: number; unattached: number;
}
export interface MediaPage {
  items: AdminMedia[];
  meta: { page: number; limit: number; total: number; totalPages: number; hasNext: boolean; hasPrevious: boolean };
}

const asset = "id originalFileName mimeType sizeBytes purpose status visibility publicUrl createdAt";
const access = "url expiresAt";

async function request<T>(field: string, query: string, variables?: Record<string, unknown>): Promise<T> {
  return (await graphqlClient.request<Record<string, T>>(query, variables))[field];
}

export const storageApi = {
  options: (purpose: MediaPurpose) => request<MediaOptions>("mediaUploadOptions",
    "query ($purpose:MediaPurpose!) { mediaUploadOptions(purpose:$purpose) { enabled maxBytes extensions } }", { purpose }),
  create: (input: { requestId: string; purpose: MediaPurpose; courseId?: string; fileName: string; mimeType: string; sizeBytes: number }) =>
    request<{ asset: MediaAsset; url: string | null; partSize: number | null; expiresAt: string }>("createMediaUpload",
      `mutation ($input:CreateMediaUploadInput!) { createMediaUpload(input:$input) { asset { ${asset} } url partSize expiresAt } }`, { input }),
  parts: (id: string, partNumbers: number[]) => request<{ partNumber: number; url: string }[]>("signMultipartUploadParts",
    "mutation ($input:SignMediaPartsInput!) { signMultipartUploadParts(input:$input) { partNumber url } }", { input: { id, partNumbers } }),
  complete: (id: string, parts?: UploadedPart[]) => request<MediaAsset>("completeMediaUpload",
    `mutation ($id:ID!,$parts:[CompleteMediaPart!]) { completeMediaUpload(id:$id,parts:$parts) { ${asset} } }`, { id, parts }),
  abort: (id: string) => request<boolean>("abortMediaUpload", "mutation ($id:ID!) { abortMediaUpload(id:$id) }", { id }),
  lesson: (courseId: string, lessonId: string, preview = false, height?: number) => {
    const name = preview ? "lessonPreviewMediaAccess" : "lessonMediaAccess";
    return request<MediaRead>(name, `query ($courseId:ID!,$lessonId:ID!,$height:Int) {
      ${name}(courseId:$courseId,lessonId:$lessonId,height:$height) { ${access} availableQualities }
    }`, { courseId, lessonId, height });
  },
  resource: (courseId: string, lessonId: string, resourceId: string) => request<MediaRead>("lessonResourceAccess",
    `query ($courseId:ID!,$lessonId:ID!,$resourceId:ID!) { lessonResourceAccess(courseId:$courseId,lessonId:$lessonId,resourceId:$resourceId) { ${access} } }`,
    { courseId, lessonId, resourceId }),
  avatar: (url?: string | null, assetId?: string | null) => request<string | null>("updateMyAvatar",
    "mutation ($url:String,$assetId:ID) { updateMyAvatar(url:$url,assetId:$assetId) }", { url, assetId }),
  stats: () => request<MediaStats>("adminMediaStorageStats", "query { adminMediaStorageStats { enabled storedBytes publicBytes privateBytes reservedBytes softLimit hardLimit stored images videos documents pending failed unattached } }"),
  list: (pagination: { page: number; limit: number }, filter: Record<string, unknown>, oldestFirst: boolean) =>
    request<MediaPage>("adminMediaAssets", `query ($pagination:PaginationInput!,$filter:AdminMediaFilter,$oldestFirst:Boolean!) {
      adminMediaAssets(pagination:$pagination,filter:$filter,oldestFirst:$oldestFirst) {
        items { ${asset} uploader courseScopeId attachments { entityId entityType } }
        meta { page limit total totalPages hasNext hasPrevious }
      }
    }`, { pagination, filter, oldestFirst }),
  adminRead: (id: string) => request<MediaRead>("adminMediaRead", `query ($id:ID!) { adminMediaRead(id:$id) { ${access} } }`, { id }),
  delete: (id: string) => request<boolean>("adminDeleteUnusedMedia", "mutation ($id:ID!) { adminDeleteUnusedMedia(id:$id) }", { id }),
  cleanup: () => request<number>("adminCleanupMedia", "mutation { adminCleanupMedia }"),
};
