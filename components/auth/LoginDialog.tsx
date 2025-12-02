"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import OAuthButtons from "@/components/auth/OAuthButtons";

function LoginDialog({ children }: { children: React.ReactNode }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenChange = () => {
    setIsModalOpen(!isModalOpen);
  };

  return (
    <div>
      <div onClick={() => setIsModalOpen(true)}>
        {children}
      </div>

      <Dialog open={isModalOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-2xl text-center font-medium">
              Log in
            </DialogTitle>
          </DialogHeader>
          <OAuthButtons />
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default LoginDialog;
