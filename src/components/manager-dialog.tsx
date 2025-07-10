import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { AuthService } from "../services/authService";
import { Button } from "./ui/button";

const ManagerDialog: React.FC = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const role = AuthService.getRoleFromToken();
    if (role === "Manager") {
      setOpen(true);
    }
  }, []);

  if (!open) return null;

  return (
    <Dialog open={true}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Manager Only Notice</DialogTitle>
          <DialogDescription>
            Selamat datang, Dialog ini tidak bisa ditutup dan hanya muncul untuk
            user dengan role Manager.
            <br />
            <span
              style={{
                display: "block",
                marginTop: 16,
                marginBottom: 8,
                fontWeight: "bold",
              }}
            >
              silahkan melakukan subscription
            </span>
            <Button
              variant="outline"
              className="bg-primary text-white"
              onClick={() => (window.location.href = "/billing")}
            >
              Go to Billing
            </Button>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default ManagerDialog;
