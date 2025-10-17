import './style.css'
import { useState } from 'react'

function App() {

  const [isOpen, setIsOpen] = useState(false);
  const [image, setImage] = useState(null);
  const [error, setError] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
    } else {
      setImage(null)
    }
  };

  return (
    <div className="bg-gray-800 h-screen w-screen">
      <div className="flex justify-center align-middle">
        <p className="text-3xl text-red-50 mt-5 font-titillium">WHAT THE FRIDGE?</p>

        <div className="fixed inset-0 flex items-center justify-center">
          <button onClick={() => setIsOpen(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Upload Image</button>

          {isOpen && (
              <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 font-titillium ">
                <div className="bg-white rounded-2xl p-6 shadow-lg w-200 h-100">
                  <h2 className="text-xl font-semibold mb-1 text-center">Upload Image</h2>
                  <p className="text-sm mb-8 text-center">Submit a photo of your fridge to get a recipe recommendation!</p>

                  {image && (
                  <img
                    src={image}
                    alt="Preview"
                    className="w-full h-60 object-cover rounded-lg mb-3"
                  />
                  )}
                  
                  <form action="/upload" method="post">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        handleImageChange(e);
                        setError(false);
                      }}
                      className="mb-4 text-sm w-full pl-14"
                    />

                    <div className="flex justify-center gap-3">
                      <button type="submit" onClick={(e) => {
                          if (!image) {
                            e.preventDefault();
                            console.log("nothing sent")
                            setError(true)
                          } 
                          else {
                            console.log("image sent")
                            setIsOpen(false);
                            setImage(null);
                          }
                        }}
                        className="px-3 py-1 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                      >
                      Upload
                      </button>
                      
                      <button type="button" onClick={() => {
                        setIsOpen(false); 
                        setImage(null);
                        setError(false);
                      }} 
                        className="px-3 py-1 rounded-lg border border-gray-300 hover:bg-gray-100">Cancel</button>

                    </div>

                      {error && (
                        <div>
                          <p className="text-red-500 text-center text-sm mt-2">Please submit a photo</p>
                        </div>
                      )}

                  </form>
                </div>
              </div>
          )}
        </div>

      </div>
    </div>
  )
}

export default App
