"use client";
import { useGetChannel } from "@/features/channels/api/use-get-channels ";
import { useChannelId } from "@/hooks/use-channel-id";
const ChannelIdPage=()=>{
    const channelId = useChannelId();
    const { data:channel,isLoading:channelLoading} =useGetChannel({id:channelId});
    if(channelLoading)
    return(
        <div>
            Channel Id Page
        </div>
    )
}
export default ChannelIdPage;