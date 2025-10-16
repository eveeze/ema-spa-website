import { useEffect } from "react";
import { useForm } from "react-hook-form";
// PERBAIKAN: Import kedua hook yang relevan
import {
  useCustomerProfile,
  useUpdateCustomerProfile,
} from "../hooks/useCustomerHooks";
import { Loader2, AlertTriangle } from "lucide-react";

// Tipe data HANYA untuk field yang ada di form.
type ProfileFormData = {
  name: string;
  phoneNumber: string;
};

const CustomerProfile = () => {
  // PERBAIKAN: Panggil kedua hook secara terpisah.
  // 1. Hook untuk mengambil data profil.
  const { data: profile, isLoading, isError } = useCustomerProfile();
  // 2. Hook untuk melakukan aksi update.
  const { mutate: updateProfile, isPending: isUpdating } =
    useUpdateCustomerProfile();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>();

  useEffect(() => {
    if (profile) {
      reset({
        name: profile.name,
        phoneNumber: profile.phoneNumber,
      });
    }
  }, [profile, reset]);

  const onSubmit = (data: ProfileFormData) => {
    // Di sini, `updateProfile` adalah fungsi `mutate` dari `useUpdateCustomerProfile`.
    // Kita perlu memastikan payload-nya sesuai dengan yang diharapkan oleh API.
    if (!profile?.id) {
      console.error("Cannot update profile without a valid customer ID.");
      // Tampilkan notifikasi error ke pengguna di sini
      return;
    }
    updateProfile({
      id: profile.id, // Sertakan ID dari data profil yang sudah ada
      ...data,
    });
  };

  // State Handling untuk UI (sudah benar)
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-10">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-600">Memuat profil...</span>
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="flex items-center gap-2 rounded-md bg-red-50 p-4 text-red-700">
        <AlertTriangle className="h-5 w-5" />
        <span>
          Terjadi kesalahan saat memuat profil Anda. Silakan coba lagi nanti.
        </span>
      </div>
    );
  }

  // Render form jika data sudah tersedia (sudah benar)
  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold text-gray-800">Profil Saya</h1>
      <p className="mb-8 text-gray-500">
        Kelola informasi profil dan kontak Anda agar kami dapat melayani Anda
        lebih baik.
      </p>

      <div className="max-w-2xl rounded-xl bg-white p-8 shadow-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Alamat Email
            </label>
            <div className="mt-1">
              <input
                type="email"
                id="email"
                value={profile.email}
                disabled
                className="block w-full cursor-not-allowed rounded-md border-gray-300 bg-gray-100 p-2 shadow-sm sm:text-sm"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Nama Lengkap
            </label>
            <div className="mt-1">
              <input
                {...register("name", { required: "Nama tidak boleh kosong" })}
                type="text"
                id="name"
                className="block w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
              {errors.name && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.name.message}
                </p>
              )}
            </div>
          </div>
          <div>
            <label
              htmlFor="phoneNumber"
              className="block text-sm font-medium text-gray-700"
            >
              Nomor Telepon
            </label>
            <div className="mt-1">
              <input
                {...register("phoneNumber", {
                  required: "Nomor telepon tidak boleh kosong",
                })}
                type="tel"
                id="phoneNumber"
                className="block w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
              {errors.phoneNumber && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.phoneNumber.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isUpdating}
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerProfile;
