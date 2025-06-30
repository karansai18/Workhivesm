   import { useParams } from "next/navigation";

   export const useJoinCode = (): string | undefined => {
  const params = useParams();
  const rawCode = params?.workspaceId as string | undefined;
  if (!rawCode) return undefined;
  const cleanCode = decodeURIComponent(rawCode).replace(/[^a-zA-Z0-9_-]/g, "");
  return cleanCode.toLowerCase();
};