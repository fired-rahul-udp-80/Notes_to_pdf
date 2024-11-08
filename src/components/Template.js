 
import { MdOutlineAutoDelete } from "react-icons/md";
import {toast} from "react-toastify"
import {useState} from 'react'
import Popup from './Popup'
 

const Template = ({register,getNotes}) => {
  const [openMailBox, setOpenMailBox] = useState(false);


  const deletePdf = async(itemId) =>{
    // delete the pdf file from the server
    console.log(itemId);
    const toastId = toast.loading("Processing");
    try{
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/deleteNotes`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: itemId }), // Send ID in the body
      })
      toast.dismiss(toastId);
      // Handle response based on status
        if (response.ok) {
          console.log("PDF deleted successfully.");
          toast.success("PDF deleted successfully");
          getNotes();
          // Optionally, handle any UI update here to reflect deletion
      } else {

          console.log("Failed to delete PDF. Status:", response.status);
          toast.error("Failed to delete PDF");
        }
    }
    catch(err){

      console.error("Error in Deleting Notes",err);
      toast.error('Internal Server Error');
    }

  }

   // Function to shorten the file name
   const shortenFileName = (fileName) => {
   const maxLength = 30; 
    // Split on uppercase letters
    const splitName = fileName.split(/(?=[A-Z])/).join(" "); // Join with space

    if (splitName.length > maxLength) {
      return splitName.substring(0, maxLength) + "..."; // Add ellipsis if longer
    }
    return splitName; // Return the full name if within limit
  };

  
  
  return (
    <div>
            <div className="w-full bg-neutral-800 min-h-[631px]">
              <div className="flex">
              <div className="text-xl rounded font-semibold bg-neutral-900 text-white  w-full px-2 py-2"
                  >Your Notes</div>
              <a href="../assets/sample.pdf" target="_blank" rel="noopener noreferrer" className="px-7 text-white font-semibold py-2 border-[1px] border-slate-500">Sample</a>
              </div>
                <div className="p-2 flex flex-col gap-y-2">
                        
                  {
                    register === null ? (
                      <div className="text-white"> Delete your notes after sending in email </div>
                    ) :  (
                      <div className="h-full relative">
                            <div className=" rounded p-2 my-2 flex flex-col gap-5 justify-between overflow-y-auto max-h-[540px]">
                              {
                                register?.map((item,index)=>{
                                  return (
                                    <div key={index} className="flex flex-col gap-y-2" >
                                      <div className="text-md font-bold text-white">
                                        {shortenFileName(item.fileName)}
                                      </div>
                                      <div className="w-full flex gap-x-2">
                                        <div className='w-full flex cursor-pointer items-end justify-center border-[1px] border-gray-600 px-4 text-white font-medium py-2 rounded '>
                                          
                                            
                                          <a href={item.filePath} target="_blank" className="w-full h-full text-center">Download</a>
                                        </div>
                                        <div onClick={() =>deletePdf(item._id)}
                                        className="cursor-pointer text-white text-2xl border-[1px]  border-gray-600 px-2 rounded flex justify-center items-center py-1">
                                          <MdOutlineAutoDelete />
                                        </div>
                                      </div>
                                    </div>
                                  )
                                })
                              }
                            </div>
                            
                          </div>
                    )
                  }
                        
                      
                      
                  
                </div>
          </div>
          
        
      <div>
        <button onClick={() =>setOpenMailBox(true)} className="w-full mt-1 text-white font-medium hover:opacity-90 py-4 bg-neutral-800">Send Your PDF Notes in Mail
        </button>
        {
          openMailBox && (
            <Popup DBData={register} setOpenMailBox={setOpenMailBox}/>
          )
        }
      </div>
    </div>
    
  )
}

export default Template