// app/page.tsx

"use client";

import { supabase } from "@/lib/supabase/supabase";
import { useEffect, useState } from "react";
import InviteDecisionModal_V2 from "@/components/features/invite/InviteDecisionModal_V2";
import PageContainer from "@/components/shared/PageContainer";
import { ProjectBoard } from "@/features/project";

const Home = () => {
  const [inviteData, setInviteData] = useState(null);

  useEffect(() => {
    const checkInvite = async () => {
      const inviteId = localStorage.getItem("invite_id");
      if (!inviteId) return;

     
      const { data, error } = await supabase
        .from("project_invitation_new")
        .select("*")
        .eq("invitation_id", inviteId)
        .maybeSingle();

      if (error) {
        console.error("초대 조회 오류:", error);
        return;
      }

      if (data && data.status === "pending") {
        setInviteData(data);
      }
    };

    checkInvite();
  }, []);

  return (
    <div className="min-h-full flex flex-col">
      <PageContainer className="flex-1">
        <ProjectBoard />
      </PageContainer>


       {/* 초대 모달 표시 */}
      {inviteData && <InviteDecisionModal_V2 invite={inviteData} 
       onCloseModal={() => setInviteData(null)}/>}
    </div>
  );
};

export default Home;
