import React, { useState } from 'react';
import './auth.scss';
import { FcGoogle } from 'react-icons/fc';
import { useUserContext } from '../../context/userContext';
import Login1 from '../../assets/login1.svg';
import Login2 from '../../assets/login2.svg';
const Signup = () => {
  const { googleSignIn } = useUserContext();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // You can handle the form submission here, maybe send the data to an API
    console.log(formData);
  };
  return (
    <div className="text=poppins flex h-full items-center justify-center bg-gray-600 ">
      <div className="flex w-3/5 overflow-hidden rounded-3xl bg-white shadow-lg">
        <div className="relative w-1/2 bg-gray-100 px-12 py-8">
          <img src={Login2} />
          <img src={Login1} />
        </div>
        <div className="shadow-deep-inner m-5 grow rounded-3xl border bg-white px-4 py-6">
          <div className="flex justify-center">
            <div className="overflow-hidden rounded-xl border-2 font-normal">
              {' '}
              <button type="submit" className="w-24 px-4 py-2">
                Sign Up
              </button>
              <button
                type="button"
                className="w-24 border-l-2 bg-purple-400 px-4 py-2 text-white"
              >
                Log In
              </button>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-6">
            <div className="flex gap-4 text-lg">
              <div className="flex flex-col">
                <label for="firstName">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  className="rounded-xl border-2 px-3 py-2"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="flex flex-col">
                <label for="lastName">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  className="rounded-xl border-2 px-3 py-2"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="flex flex-col">
              <label for="email">Email Address</label>
              <input
                type="email"
                name="email"
                className="rounded-xl border-2 px-3 py-2"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="flex flex-col">
              <label for="password">Password</label>
              <input
                type="password"
                name="password"
                className="rounded-xl border-2 px-3 py-2"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div class="my-4 flex items-center justify-center">
              <div class="flex-grow border-t border-gray-300"></div>
              <span class="mx-4 flex-shrink text-gray-600">or</span>
              <div class="flex-grow border-t border-gray-300"></div>
            </div>
          </form>
          <button
            onClick={googleSignIn}
            className="flex w-full items-center justify-center gap-4 rounded-3xl border-2 px-6 py-2"
          >
            <FcGoogle />
            <div className="text-lg">Continue with Google</div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Signup;
