import AccountSettingForm from "@/components/dashboard/settings/account-setting/account-setting-form";
import EditProfileForm from "@/components/dashboard/settings/account-setting/edit-profile-form";
import { ProfilePhotoUploader } from "@/components/dashboard/settings/account-setting/profile-photo-uploader";
import { fetchAccountProfile } from "./fetch";
import { formatUrl } from "@/lib/format";
import { getCountryPhoneOptions } from "@/server/general";

const AccountSettingPage = async () => {
  const countryOptions = await getCountryPhoneOptions();
  const { data: accountProfile } = await fetchAccountProfile();

  return (
    <div className="flex gap-12">
      {/* Left: Form */}
      <div className="flex-1">
        {/* Account Setting Section */}
        <AccountSettingForm defaultValues={accountProfile} />
        <hr className="my-8" />
        {/* Edit Profile Section */}
        <EditProfileForm
          defaultValues={accountProfile}
          countryOptions={countryOptions}
        />
      </div>
      {/* Right: Profile Photo */}
      <div className="flex flex-col">
        <div className="mb-2 font-medium">Profile photo</div>
        <ProfilePhotoUploader
          photoUrl={formatUrl(accountProfile.photo_profile)}
          fullName={accountProfile.full_name}
        />
      </div>
    </div>
  );
};

export default AccountSettingPage;
