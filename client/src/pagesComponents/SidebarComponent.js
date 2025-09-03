import React, { useState } from "react";
import { Sidebar } from "flowbite-react";
import {
  FaClinicMedical,
  FaCommentMedical,
  FaHireAHelper,
} from "react-icons/fa";
import {
  MdOutlineMedicationLiquid,
  MdWorkHistory,
  MdContactPhone,
} from "react-icons/md";
import { HiViewBoards } from "react-icons/hi";
import { GrSchedule } from "react-icons/gr";
import { IoSettings, IoLogOut } from "react-icons/io5";
import { MessageCircle } from "lucide-react";

function SidebarComponent({ onItemClick }) {
  const handleItemClick = (pageComponent) => {
    onItemClick(pageComponent);
  };

  return (
    <Sidebar>
      <Sidebar.Items>
        <Sidebar.ItemGroup>
          <Sidebar.Item
            href="/Dashboard"
            icon={FaClinicMedical}
            onClick={() => handleItemClick("Home")}
          >
            Home
          </Sidebar.Item>
          <Sidebar.Item
            href="/Dashboard/Appointments"
            icon={HiViewBoards}
            onClick={() => handleItemClick("Appointments")}
          >
            Appointments
          </Sidebar.Item>
          <Sidebar.Item
            href="/Dashboard/Prescription"
            icon={MdOutlineMedicationLiquid}
            onClick={() => handleItemClick("Prescription")}
          >
            Prescription
          </Sidebar.Item>
          <Sidebar.Item
            href="/Dashboard/Schedualing"
            icon={GrSchedule}
            onClick={() => handleItemClick("Scheduling")}
          >
            Scheduling
          </Sidebar.Item>
          <Sidebar.Item
            href="/Dashboard/Chat"
            icon={MessageCircle}
            onClick={() => handleItemClick("Chat")}
          >
            Messages
          </Sidebar.Item>
          <Sidebar.Item
            href="/Dashboard/History"
            icon={MdWorkHistory}
            onClick={() => handleItemClick("History")}
          >
            History
          </Sidebar.Item>
          <Sidebar.Item
            href="/Dashboard/Inbox"
            icon={FaCommentMedical}
            onClick={() => handleItemClick("Inbox")}
          >
            Inbox
          </Sidebar.Item>
        </Sidebar.ItemGroup>
        <Sidebar.ItemGroup>
          <Sidebar.Item
            href="/"
            icon={IoLogOut}
            onClick={() => handleItemClick("Sign Out")}
          >
            Sign Out
          </Sidebar.Item>
          <Sidebar.Item
            href="/Dashboard/Settings"
            icon={IoSettings}
            onClick={() => handleItemClick("Settings")}
          >
            Settings
          </Sidebar.Item>
          <Sidebar.Item
            href="/Dashboard/Contact"
            icon={MdContactPhone}
            onClick={() => handleItemClick("Contact")}
          >
            Contact
          </Sidebar.Item>
          <Sidebar.Item
            href="/Dashboard/Help"
            icon={FaHireAHelper}
            onClick={() => handleItemClick("Help")}
          >
            Help
          </Sidebar.Item>
        </Sidebar.ItemGroup>
      </Sidebar.Items>
    </Sidebar>
  );
}

export default SidebarComponent;
