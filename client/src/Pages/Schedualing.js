import React, { useState } from "react";
import { Button } from "flowbite-react";
import { BiSolidBookAdd } from "react-icons/bi";
import { TbBrandBooking } from "react-icons/tb";
import RequestAppointment from "./RequestedAppointment";
import AvailableAppointments from "./AvailableAppointments";

function Schedualing() {
  const [activeTab, setActiveTab] = useState('available');

  return (
    <div>
      <Button.Group>
        <Button 
          color={activeTab === 'available' ? 'blue' : 'gray'}
          onClick={() => setActiveTab('available')}
        >
          <TbBrandBooking className="mr-1 h-5 w-5 flex-auto" />
          Available Appointments
        </Button>
        <Button 
          color={activeTab === 'request' ? 'blue' : 'gray'}
          onClick={() => setActiveTab('request')}
        >
          <BiSolidBookAdd className="mr-1 h-5 w-5 flex-auto" />
          Request Form
        </Button>
      </Button.Group>
      <div className="mt-6">
        {activeTab === 'available' ? <AvailableAppointments /> : <RequestAppointment />}
      </div>
    </div>
  );
}
export default Schedualing;
