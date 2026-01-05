import { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  useCustomerProfile,
  useUpdateCustomerProfile,
} from "../hooks/useCustomerHooks";
import { Loader2, AlertTriangle, User as UserIcon } from "lucide-react";
import { motion } from "framer-motion";

// Tipe data HANYA untuk field yang ada di form.
type ProfileFormData = {
  name: string;
  phoneNumber: string;
};

const CustomerProfile = () => {
  // 1. Ambil profil
  const { data: profile, isLoading, isError } = useCustomerProfile();

  // 2. Hook untuk update
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
    if (!profile?.id) {
      console.error("Cannot update profile without a valid customer ID.");
      return;
    }

    updateProfile({
      id: profile.id,
      ...data,
    });
  };

  // ========== LOADING & ERROR STATE ==========

  if (isLoading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-3 text-slate-600">
        <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
        <p className="text-sm">Memuat profil Anda...</p>
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="mt-4 rounded-2xl border border-rose-100 bg-rose-50/80 p-4 text-sm text-rose-700">
        <div className="flex items-start gap-2">
          <AlertTriangle className="mt-[2px] h-5 w-5" />
          <p>
            Terjadi kesalahan saat memuat profil Anda. Silakan coba lagi nanti.
          </p>
        </div>
      </div>
    );
  }

  // ========== MAIN UI ==========

  return (
    <div className="pb-10 pt-2 md:pt-4">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-600">
            Pengaturan Akun
          </p>
          <h1 className="mt-1 text-xl font-semibold text-slate-900 md:text-2xl">
            Profil Saya
          </h1>
          <p className="mt-1 max-w-xl text-xs text-slate-500 md:text-sm">
            Kelola informasi dasar agar tim Ema Baby Spa dapat menghubungi Anda
            dengan nyaman sebelum dan sesudah sesi perawatan.
          </p>
        </div>
      </div>

      {/* Card */}
      <motion.div
        className="max-w-3xl rounded-3xl bg-white/95 shadow-xl ring-1 ring-slate-100"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        {/* Header dalam card */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 md:px-7">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-50 text-sky-600">
              <UserIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-800">
                Informasi Kontak
              </p>
              <p className="text-[11px] text-slate-500">
                Data ini digunakan untuk keperluan reservasi & pengingat jadwal.
              </p>
            </div>
          </div>

          <div className="hidden text-right text-[11px] text-slate-400 md:block">
            <p>ID Pelanggan</p>
            <p className="font-mono text-[11px] text-slate-500">
              {profile.id?.slice(0, 8)}…
            </p>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6 px-5 py-6 md:px-7 md:py-7"
        >
          {/* Email (read only) */}
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="text-xs font-medium text-slate-700"
            >
              Alamat Email
            </label>
            <input
              type="email"
              id="email"
              value={profile.email}
              disabled
              className="block w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-600 shadow-inner focus:outline-none"
            />
            <p className="text-[11px] text-slate-400">
              Email digunakan untuk akun dan notifikasi penting. Hubungi admin
              apabila ingin mengganti email.
            </p>
          </div>

          {/* Nama Lengkap */}
          <div className="space-y-1.5">
            <label
              htmlFor="name"
              className="text-xs font-medium text-slate-700"
            >
              Nama Lengkap
            </label>
            <input
              {...register("name", { required: "Nama tidak boleh kosong" })}
              type="text"
              id="name"
              placeholder="Masukkan nama lengkap Anda"
              className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 shadow-sm transition focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
            />
            {errors.name && (
              <p className="text-[11px] text-rose-600">{errors.name.message}</p>
            )}
          </div>

          {/* Nomor Telepon */}
          <div className="space-y-1.5">
            <label
              htmlFor="phoneNumber"
              className="text-xs font-medium text-slate-700"
            >
              Nomor Telepon / WhatsApp
            </label>
            <input
              {...register("phoneNumber", {
                required: "Nomor telepon tidak boleh kosong",
              })}
              type="tel"
              id="phoneNumber"
              placeholder="Contoh: 08xxxxxxxxxx"
              className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 shadow-sm transition focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
            />
            {errors.phoneNumber && (
              <p className="text-[11px] text-rose-600">
                {errors.phoneNumber.message}
              </p>
            )}
            <p className="text-[11px] text-slate-400">
              Pastikan nomor aktif dan terhubung ke WhatsApp.
            </p>
          </div>

          {/* Footer actions */}
          <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[11px] text-slate-400">
              Perubahan profil akan langsung tersimpan pada akun Anda.
            </p>
            <div className="flex justify-end">
              <motion.button
                type="submit"
                disabled={isUpdating}
                whileHover={
                  !isUpdating
                    ? {
                        y: -1,
                        boxShadow: "0 16px 30px rgba(56,189,248,0.28)",
                      }
                    : {}
                }
                whileTap={!isUpdating ? { scale: 0.97 } : {}}
                transition={{ duration: 0.16 }}
                className="inline-flex items-center justify-center rounded-full bg-sky-500 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {isUpdating && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Simpan Perubahan
              </motion.button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default CustomerProfile;
