import './App.css';
import Notepad from './components/Notepad';
import Template from './components/Template';
import { useEffect, useState } from 'react';
import MainPageLoader from "./components/MainPageLoder";

function App() {
  const [getAllNotes, setGetAllNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  function simulateLoadingRequest() {
    // Simulates a loading request; returns a "promise" that resolves after 2.5 seconds
    return new Promise(resolve => setTimeout(resolve, 2500));
  }

  const getNotes = async () => {
    const url = `${process.env.REACT_APP_BASE_URL}/getNotes`;
    try {
      const response = await fetch(url);
      const result = await response.json();
      setGetAllNotes(result.data || []); // Ensures `getAllNotes` always has a safe value
      console.log("FORM RESPONSE:", result.data);
    } catch (err) {
      console.log("Error fetching notes:", err);
    }
  };

  useEffect(() => {
    // Set up initial loading state
    simulateLoadingRequest().then(() => {
      setIsLoading(false);
      getNotes(); // Fetch notes once loading is complete
    });
  }, []); // Only runs once on component mount

  if (isLoading) {
    return (
      <div className=" w-screen h-screen flex justify-center items-center">
        <MainPageLoader />
      </div>
    );
  }

  return (
    <>
      <div className="md:mx-10 h-screen bg-white flex md:flex-row flex-col gap-x-1">
        <div className="md:w-[70%]">
          <Notepad getNotes={getNotes} />
        </div>
        <div className="md:w-[30%] mt-2 md:mt-0">
          <Template register={getAllNotes} getNotes={getNotes} />
        </div>
      </div>
    </>
  );
}

export default App;
