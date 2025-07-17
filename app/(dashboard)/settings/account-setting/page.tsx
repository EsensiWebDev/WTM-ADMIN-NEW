import AccountSettingForm from "@/components/dashboard/settings/account-setting/account-setting-form";
import EditProfileForm from "@/components/dashboard/settings/account-setting/edit-profile-form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { fetchAccountProfile } from "./fetch";

const AccountSettingPage = async () => {
  const accountProfile = await fetchAccountProfile();

  return (
    <div className="flex gap-12">
      {/* Left: Form */}
      <div className="flex-1">
        {/* Account Setting Section */}
        <AccountSettingForm defaultValues={accountProfile} />
        <hr className="my-8" />
        {/* Edit Profile Section */}
        <EditProfileForm defaultValues={accountProfile} />
      </div>
      {/* Right: Profile Photo */}
      <div className="flex flex-col">
        <div className="mb-2 font-medium">Profile photo</div>
        <div className="relative">
          <Avatar className="h-36 w-36 rounded-lg">
            <AvatarImage src={accountProfile.profileImage} alt="Profile" />
            <AvatarFallback className="rounded-lg">CN</AvatarFallback>
          </Avatar>
          <Button
            size="icon"
            className="absolute -bottom-4 -right-4 bg-[#2d3e3f] text-white rounded-full"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke="#fff"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M16.474 5.341a2.5 2.5 0 1 1 3.536 3.535M3 17.25V21h3.75l10.607-10.607a2.5 2.5 0 0 0-3.535-3.535L3 17.25Z"
              />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AccountSettingPage;
