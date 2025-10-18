import './style.css'
import { useState } from 'react'

function App() {

  const [isOpen, setIsOpen] = useState(false);
  const [image, setImage] = useState(null);
  const [image2, setImage2] = useState(null);
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
    <div className="bg-[#0e0e0e] h-screen w-screen">
      <div className="absolute inset-0 bg-gradient-radial from-[#3a3a3a] via-[#1a1a1a] to-[#0e0e0e] opacity-90 h-screen w-screen pointer-events-none"></div>
      <div className="bg-/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-[0_0_40px_rgba(0,0,0,0.6)] w-1/4 h-full slide-fade-in" >
        <div className="flex flex-col items-center justify-center ml-5 pr-0">
            <p className="text-6xl text-red-50 mt-5 font-titillium mb-6 text-center">WHAT THE FRIDGE?</p>

            <pre className="text-gray-400 text-sm whitespace-pre-wrap text-center mb-10">
              Ever stare into your fridge, wondering what to cook for breakfast, lunch, dinner, or even just a snack?
              <br/><br/>
              No worries, snap a photo of your fridge, and we'll suggest recipes based on what you've got.
              <br/><br/>
              No stress, no guesswork.
            </pre>

            <button onClick={() => setIsOpen(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-titillium hover:scale-110 transition-all duration-300">Upload Image</button>

            {isOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 font-titillium ">
                  <div className="bg-white rounded-2xl p-6 shadow-lg w-80">
                    <h2 className="text-xl font-semibold mb-1 text-center">Upload Image</h2>
                    <p className="text-sm mb-2 text-center">Submit a photo of your fridge to get a recipe recommendation!</p>

                    {image && (
                    <img
                      src={image}
                      alt="Preview"
                      className="w-full h-60 object-cover rounded-lg mb-3"
                    />
                    )}
                    
                    <form action="/upload" method="post">
                      <div className="flex justify-center align-center">
                        <label htmlFor="img_input" className="mb-4 bg-neutral-900/25 px-6 py-2 rounded-sm hover:bg-neutral-900/50 hover:scale-110 transition-all duration-300">Browse Files</label>
                      </div>
                      <input
                        type="file"
                        id="img_input"
                        accept="image/*"
                        onChange={(e) => {
                          handleImageChange(e);
                          setError(false);
                        }}
                        className="hidden"
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
                              setImage2(image);
                              setIsOpen(false);
                              setImage(null);
                            }
                          }}
                          className="px-3 py-1 rounded-lg bg-blue-600 text-white hover:bg-blue-700 hover:scale-110 transition-all duration-300"
                        >
                        Upload
                        </button>
                        
                        <button type="button" onClick={() => {
                          setIsOpen(false); 
                          setImage(null);
                          setError(false);
                        }} 
                          className="px-3 py-1 rounded-lg border border-gray-300 hover:bg-gray-100 hover:scale-110 transition-all duration-300">Cancel</button>

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
            
            <div className="mt-5 font-titillium text-gray-500">
              <p className="my-6 text-center">Last Image Uploaded:</p>
              
              <img
                id="bottom_image"
                src={image2 ? image2 : "/assests/placeholder.jpg"}
                alt="Preview"
                className="w-full h-70 object-contain rounded-lg overflow-hidden hover:scale-110 transition-all duration-300"
              />
            </div>

          </div>
      </div>
    </div>
  )
}

export default App
