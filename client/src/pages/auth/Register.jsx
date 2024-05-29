import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";


import { MdOutlineMail } from "react-icons/md";
import { FaUser } from "react-icons/fa";
import { MdPassword } from "react-icons/md";
import { MdDriveFileRenameOutline } from "react-icons/md";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

const SignUpPage = () => {
	let navigate = useNavigate();

	const [formData, setFormData] = useState({
		email: "",
		username: "",
		fullName: "",
		password: "",
	});

  const {t} = useTranslation();

	const { mutate, isError, isPending, error } = useMutation({
		mutationFn: async ({ email, username, fullName, password }) => {
			try {
				const res = await fetch("/api/auth/signup", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						email,
						username,
						fullName,
						password
					})
				})
				
				const data = await res.json()
				if (!res.ok){ throw new Error(data.error || "Failed to create account") }
				console.log(data);
				return data
			} catch (error) {
				console.log(error);
				throw error;
			}
		},
		onSuccess: () => {
			toast.success("Account created successfully")
			navigate('/')
		},
		// onError: (error)=> {
		// 	toast.error(error.message)
		// }
	})


	const handleSubmit = (e) => {
		e.preventDefault();
		mutate(formData)
	};

	const handleInputChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};


	return (
		<div className='max-w-screen-xl mx-auto flex h-svh px-10'>
			
			<div className='flex-1 flex flex-col justify-center items-center'>
				<form className='lg:w-2/3  mx-auto md:mx-20 flex gap-4 flex-col' onSubmit={handleSubmit}>
					
					<h1 className='text-4xl font-extrabold text-primary'>{t('register-title')}</h1>
					<label className='input input-bordered rounded flex items-center gap-2'>
						<MdOutlineMail />
						<input
							type='email'
							className='grow'
							placeholder={t('register-email')}
							name='email'
							onChange={handleInputChange}
							value={formData.email}
						/>
					</label>
					<div className='flex gap-4 flex-wrap'>
						<label className='input input-bordered rounded flex items-center gap-2 flex-1'>
							<FaUser  />
							<input
								type='text'
								className='grow '
								placeholder={t('register-username')}
								name='username'
								onChange={handleInputChange}
								value={formData.username}
							/>
						</label>
						<label className='input input-bordered rounded flex items-center gap-2 flex-1'>
							<MdDriveFileRenameOutline />
							<input
								type='text'
								className='grow'
								placeholder={t('register-fullname')}
								name='fullName'
								onChange={handleInputChange}
								value={formData.fullName}
							/>
						</label>
					</div>
					<label className='input input-bordered rounded flex items-center gap-2'>
						<MdPassword />
						<input
							type='password'
							className='grow'
							placeholder={t('register-password')}
							name='password'
							onChange={handleInputChange}
							value={formData.password}
						/>
					</label>
					<button className='btn rounded-full btn-primary text-white'>{
						isPending ? "Loading..." : t('register-submit')
					}</button>
					{isError && <p className='text-red-500'>{error.message}</p>}
				</form>
				<div className='flex flex-col lg:w-2/3 gap-2 mt-4'>
					<p className=' text-lg'>{t('register-havent-account')}</p>
					<Link to='/login'>
						<button className='btn rounded-full btn-primary text-white btn-outline w-full'>{t('login-btn')}</button>
					</Link>
				</div>
			</div>
		</div>
	);
};
export default SignUpPage;