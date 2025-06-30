"use client";

import { Button } from "@/components/ui/button";
import { useJoinCode } from "@/hooks/useJoinCode";
import { useGetWorkspaceInfo } from "@/features/workspaces/api/use-get-workspace-info";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Loader } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import VerificationInput from "react-verification-input";

const JoinPage = () => {
  const router = useRouter();
  const joinCode = useJoinCode(); // from /join/[joinCode]
  const { data, isLoading } = useGetWorkspaceInfo({ joinCode: joinCode! });
  const joinMutation = useMutation(api.workspaces.join);

  const [enteredCode, setEnteredCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    setError(null);
    setLoading(true);
    try {
      await joinMutation({
        joinCode: enteredCode,
        workspaceId: data._id,
      });
      router.push(`/workspace/${data._id}`);
    } catch (err: any) {
      setError(err.message || "Failed to join workspace");
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || !data) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-y-8 items-center justify-center bg-white p-8 rounded-lg shadow-md">
      <Image src="/next.svg" width={60} height={60} alt="Logo" />
      <div className="flex flex-col gap-y-4 items-center justify-center max-w-md">
        <div className="flex flex-col gap-y-2 items-center justify-center">
          <h1 className="text-2xl font-bold">Join {data.name}</h1>
          <p className="text-md text-muted-foreground">
            Enter the 6-digit join code for this workspace
          </p>
        </div>

        <VerificationInput
          length={6}
          classNames={{
            container: "flex gap-x-2",
            character:
              "uppercase h-auto rounded-md border border-gray-300 flex items-center justify-center text-lg font-medium text-gray-500",
            characterInactive: "bg-muted",
            characterSelected: "bg-white text-black",
            characterFilled: "bg-white text-black",
          }}
          autoFocus
          onChange={(val) => setEnteredCode(val.toLowerCase())}
        />

        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button
          onClick={handleJoin}
          disabled={loading || enteredCode.length !== 6}
        >
          {loading ? "Joining..." : "Join Workspace"}
        </Button>
      </div>

      <div className="flex gap-x-4">
        <Button size="lg" variant="outline" asChild>
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    </div>
  );
};

export default JoinPage;
