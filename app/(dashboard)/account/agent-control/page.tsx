import AgentControlTable from "./agent-control-table";

export interface AgentControlTableResponse {
  id: string;
  name: string;
  company: string;
  email: string;
  phone_number: string;
  status: string;
}

export const getData = async () => {
  const data = [
    {
      id: "1",
      name: "kelvin",
      company: "esensi digital",
      email: "kelvin@wtmdigital.com",
      phone_number: "081234567800",
      status: "approved",
    },
    {
      id: "2",
      name: "budi",
      company: "esensi digital",
      email: "budi@wtmdigital.com",
      phone_number: "081234567800",
      status: "rejected",
    },
  ] as AgentControlTableResponse[];

  return data;
};

const AgentControl = async () => {
  const promises = Promise.all([getData()]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">User Management</h1>
      </div>

      {/* <DataTableSkeleton
        columnCount={7}
        cellWidths={[
          "10rem",
          "30rem",
          "10rem",
          "10rem",
          "6rem",
          "6rem",
          "6rem",
        ]}
      /> */}
      <div className="w-full">
        <AgentControlTable promises={promises} />
      </div>
    </div>
  );
};

export default AgentControl;
