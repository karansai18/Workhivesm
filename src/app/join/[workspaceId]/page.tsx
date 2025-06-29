"use client";
import { Button } from "@/components/ui/button";
import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";
import { useGetWorkspaceInfo } from "@/features/workspaces/api/use-get-workspace-info";
import { useworkspaceId } from "@/hooks/use-workspace-id";
import { Loader } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import VerificationInput from "react-verification-input";
import { Id } from "../../../../convex/_generated/dataModel";


const JoinPage = () => {
    const workspaceId = useworkspaceId() as Id<"workspaces">;
    const {data,isLoading}=useGetWorkspaceInfo({id:workspaceId});
  return (
    <div className="h-full flex flex-col gap-y-8 items-center justify-center bg-white p-8 rounded-lg shadow-md">
      <Image src="public\next.svg" width={60} height={60} alt="Logo" />
      <div className="flex flex-col gap-y-4 items-center justify-center max-w-md">
        <div className="flex flex-col gap-y-2 items-center justify-center">
            <h1 className="text-2xl font-bold">
                Join {data?.name}
            </h1>
            <p className="text-md text-muted-foreground">
                Enter the workspace to join
            </p>
        </div>
        <VerificationInput
            length={6}
            classNames={{
                container: "flex gap-x-2",
                character:"uppercase h-auto rounded-md border border-gray-300 flex items-center justify-center text-lg font-medium text-gray-500",
                characterInactive: "bg-muted",
                characterSelected:"bg-white text-black",
                characterFilled:"bg-white text-black",
            }}
            autoFocus
        />
      </div>
      <div className="flex gap-x-4">
        <Button
            size="lg"
            variant={"outline"}
            asChild
        >
        <Link href="/">
            Back to Home
        </Link>    
        </Button>
      </div>
    </div>
  );
};

export default JoinPage;
