import React from 'react'
import { useEffect } from 'react';
import {useForm} from "react-hook-form"
import { FaWindowClose } from "react-icons/fa";
import {toast} from 'react-toastify'

const Popup = ({DBData,setOpenMailBox}) => {
    const { register,
        handleSubmit,
        reset,
       formState:{errors,isSubmitSuccessful} 
       } = useForm(); 

       const id = DBData?.map((data) =>data._id);
       //console.log(ids);
       const submitHandler = async (data)=>{
        console.log(data);
        if (!id || id.length === 0) {
            toast.error("Notes section is Empty"); // Show toast if `ids` is empty
            return; // Stop further execution
        }
        const payload = {
            id : id,
            userEmail : data.userEmail
        };
        const toastId = toast.loading('Processing');
        try{
            const response = await fetch(`${process.env.REACT_APP_BASE_URL}/sendMail`,{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body:JSON.stringify(payload),
            })
            const result = response.json();
            toast.dismiss(toastId);
            if(!response.ok){
                toast.error(result.message);
                throw new Error(result.message);
                
            }
           // console.log("Form response:",result);
           toast.success("Email Sent Successfully");


        }catch(err){
            console.log("Error occured during send mail ",err);
            toast.error("Email id wrong or Server Error");
        }
    }

    useEffect(() =>{
        if(isSubmitSuccessful){
            reset({
                userEmail : "",
            })
            setOpenMailBox(false);
        }
    },[reset,isSubmitSuccessful]);

  return (
    <div className="w-full h-full fixed top-0 left-0 backdrop-blur-sm flex justify-center items-center px-5">
        <div className="relative flex flex-col w-[370px] sm:w-[400px] md:w-[500px] py-5 gap-y-4 z-20 border-[1px] bg-transparent px-10 rounded">
        <div className="flex justify-end absolute right-5">
        <FaWindowClose onClick={() =>setOpenMailBox(false)}
        className="text-white text-xl cursor-pointer"
        />
        </div>
        <form onSubmit={handleSubmit(submitHandler)}>
            <div className="flex flex-col gap-y-2 text-white">
                <label htmlFor="" className="font-medium text-lg">Email</label>
                <input type="text" placeholder="Type email at most one..."
                name ='userEmail'
                {...register('userEmail',{required:true})}
                className="border outline-none px-2 py-3 rounded border-neutral-400 text-black font-bold"/>
                {
                    errors.userEmail && <p className="text-red-600 animate-bounce">Email required</p>
                }
            </div>
            <div className="mt-5">
            <button type='submit'
            className="bg-white px-8 py-2 rounded shadow text-black font-bold hover:opacity-80"
            >Send</button>
            </div>
        </form>
        


      </div>
    </div>
  )
}

export default Popup