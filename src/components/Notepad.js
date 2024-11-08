import React, {useEffect } from 'react'
 
 
import {useForm} from "react-hook-form"
import { toast } from 'react-toastify';



const Notepad = ({getNotes}) => {
    
     const { register,
     handleSubmit,
     reset,
    formState:{errors,isSubmitSuccessful} 
    } = useForm(); 
    
    const submitHandler = async (data)=>{
       
        console.log(data);
        const formData = new FormData();
        formData.append('notesTitle', data.notesTitle);
        formData.append('notes', data.notes);
        console.log('formData',formData);
        const toastId = toast.loading("Processing")
        try{
            console.log(process.env.REACT_APP_BASE_URL);
            const response = await fetch(`${process.env.REACT_APP_BASE_URL}/createNotes`, {
                method:'POST',
                body:formData

            });
           
            const result = await response.json();
            toast.dismiss(toastId);
            if(!response.ok){
                toast.error(result.message);
                throw new Error(response.message);

            }
            console.log("Form response:",result);
            toast.success('Notes Send Successfully')

        }
        catch(error){
            toast.dismiss(toastId);
            console.log('Error during form Submission',error);
            toast.error('Error during form Submission');
        }
           
    }    
    useEffect(() =>{
        if(isSubmitSuccessful){
          reset({
          notesTitle:'',
          notes:'',
          }) 
        getNotes();
        }
        
      },[reset,isSubmitSuccessful]);

  return (
    <div className="relative flex flex-col bg-neutral-800 md:mx-auto">
        <form onSubmit={handleSubmit(submitHandler)} className="flex flex-col justify-center items-start">
            
            <label
            className="text-xl rounded font-semibold bg-neutral-900 text-white  w-full px-2 py-2"
            >Create Your PDF Notes</label>
            <div className=" w-full h-full font-medium mb-2">
            <div className="w-full h-10 relative">
            <input type="text" 
            name="NotesTitle"
            placeholder="Write Title of your Notes" 
            className="w-full h-full bg-neutral-800 px-2 border border-neutral-900 outline-none text-white "
            {...register('notesTitle',{required:true})}
            />
            {
                errors.notesTitle && <p className=" absolute left-2 top-8 z-10 text-red-600 animate-bounce">Write title of your Notes...</p>
             }
            </div>

            <textarea
             name="notes" 
             id="textarea"
             placeholder="Type here..."
             className="relative w-full h-full border-none outline-none min-h-[551px] text-white bg-neutral-800 px-2 py-2"
             {...register('notes',{required:true})}
             ></textarea>
             {
                errors.notes && <p className=" absolute top-28 left-2 text-red-600 animate-bounce">Write your Notes...</p>
             }
            </div>
           
           
           <div className="w-full px-5 flex flex-col justify-center items-center">
           <h2 className="text-red-600 border-t-[1px] border-neutral-900 w-full text-sm text-center font-semibold"> Alert :- After Downloading or Sending your notes in Email, Please delete it for your Privacy !</h2>
           <a className="text-red-600 font-semibold text-xs  text-center " href="http://itsrahulkumar.netlify.app">All right reserved | Creater | Rahul Kumar</a>
           </div>
            
    
            <div className="">
                <button type="submit"
                className="bg-neutral-800 absolute top-0 right-0 w-[250px] px-10 py-[10px] border border-gray-600 text-white font-bold hover:opacity-80"
                >Create PDF</button>
            </div>
        </form>
    </div>
  )
}

export default Notepad