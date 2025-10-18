import './style.css'
import { useState, useEffect } from 'react'

function App() {

  const [isOpen, setIsOpen] = useState(false);
  const [image, setImage] = useState(null);
  const [image2, setImage2] = useState(null);
  const [error, setError] = useState(false);
  const [countLoad, setCountLoad] = useState(false);

  const [resultData, setResultData] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [allergyInput, setAllergyInput] = useState('');
  const [sentResults, setSentResults] = useState(false);
  const [page, setPage] = useState(0);
  const itemsPerPage = 5;

  const [dots, setDots] = useState('');

  useEffect(() => {
    if (!countLoad) {
      setDots('');
      return;
    }

    const interval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);

    return () => clearInterval(interval);
  }, [countLoad]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
    } else {
      setImage(null)
    }
  };

const handleFormSubmission = async (e) => {
  e.preventDefault();
  setCountLoad(true);
  setResultData(null);

  const fileInput = e.target.querySelector('#img_input');
  const file = fileInput.files[0];

  if (!file) {
    console.log('nothing sent');
    setError(true);
    setCountLoad(false);
    return;
  }

  console.log('image sent');
  setIsOpen(false);

  const formData = new FormData();
  formData.append('image_file', file);

  try {
    const response = await fetch('http://127.0.0.1:5000/vision', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response data:', data.result);

    let raw = data.result;
    raw = raw.replace(/```json\s*/, '').replace(/```/, '');

    let parsedData;
    try {
      parsedData = JSON.parse(raw);
    } catch (err) {
      console.error('Failed to parse JSON:', err);
      parsedData = {};
    }

    if (response.ok) {

      if (parsedData.Invalid === 0) {
        alert("No food detected in the image.");
        setCountLoad(false);
        return;
      }

      setResultData(parsedData);
      console.log(parsedData);
      setImage2(URL.createObjectURL(file));
      setImage(null);
      setPage(0);
    } else {
      console.error(data.error || 'Something went wrong');
      alert(data.error || 'Something went wrong')
    }
  } catch (err) {
    console.error('Network error:', err);
  } finally {
    setCountLoad(false);
  }
};

  const itemsArray = Object.entries(resultData || {});
  const totalPages = Math.ceil(itemsArray.length / itemsPerPage) || 1;
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState(0);

  const visibleItems = itemsArray.slice(
    page * itemsPerPage,
    page * itemsPerPage + itemsPerPage
  );

  const addNewRow = () => {
    if (!resultData) return;

    let counter = 1;
    let newKey  = `New Item ${counter}`;
    while (resultData[newKey]) {
      counter += 1;
      newKey = `New Item ${counter}`;
    }

    setResultData(prevData => ({
      ...prevData,
      [newKey]: {Quantity: 0}
    }));
  };

  return (
    <div className="bg-[#0e0e0e] h-screen w-screen flex flex-row">
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
                    
                    <form onSubmit={handleFormSubmission}>
                      <div className="flex justify-center align-center">
                        <label htmlFor="img_input" className="mb-4 bg-neutral-900/25 px-6 py-2 rounded-sm hover:bg-neutral-900/50 hover:scale-110 transition-all duration-300">Browse Files</label>
                      </div>
                      <input
                        type="file"
                        id="img_input"
                        accept="image/*"
                        onChange={(e) => {
                          handleImageChange(e);
                        }}
                        className="hidden"
                      />

                      <div className="flex justify-center gap-3">
                        <button 
                          type="submit"
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
      
      {/* Right Half Section */}
      <div className="absolute inset-0 bg-gradient-radial from-[#3a3a3a] via-[#1a1a1a] to-[#0e0e0e] opacity-90 h-screen w-3/4 flex left-1/4 justify-center align-center font-titillium">
          
          {countLoad && !sentResults && (
            <p className="text-white text-3xl mt-5 text-center">Counting Items{dots}</p>
          )}

          {!countLoad && resultData && !sentResults && (
            <div className="w-full max-w-2xl text-white">
              <p className="text-3xl mb-4 mt-5 text-center">Finished Counting!</p>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr>
                    <th className="border-b border-gray-400 p-2">Item</th>
                    <th className="border-b border-gray-400 p-2">Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleItems.map(([item, info]) => (
                    <tr key={item} className={`border-b border-gray-600 p-2 drop-animation`}>
                      <td className="p-2">{item}</td>
                      <td
                        className="p-2 cursor-pointer"
                        onClick={() => setEditingItem(item)}
                      >
                        {editingItem === item ? (
                          <input
                            type="number"
                            className="w-16 bg-gray-700 text-white p-1 rounded"
                            value={info.Quantity}
                            autoFocus
                            onChange={(e) => {
                              let newQuantity = parseInt(e.target.value, 10) || 0;
                              if (newQuantity < 0) {
                                newQuantity = 0;
                              }
                              setResultData(prevData => ({
                                ...prevData,
                                [item]: {
                                  ...prevData[item],
                                  Quantity: newQuantity
                                }
                              }));
                            }}
                            onBlur={() => setEditingItem(null)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') setEditingItem(null);
                            }}
                          />
                        ) : (
                          info.Quantity
                        )}
                      </td>
                    </tr>
                  ))}
                  
                  {/* Add Row Section */}
                  {page === totalPages - 1 && (
                    <tr>
                      <td className="border-b border-gray-600 p-2">
                        <input
                          type="text"
                          placeholder="New Item"
                          className="w-full bg-gray-700 text-white p-1 rounded"
                          value={newItemName}
                          onChange={(e) => setNewItemName(e.target.value)}
                        />
                      </td>
                      <td className="border-b border-gray-600 p-2">
                        <input
                          type="number"
                          className="w-16 bg-gray-700 text-white p-1 rounded"
                          value={newItemQuantity}
                          onChange={(e) => setNewItemQuantity(parseInt(e.target.value, 10) || 0)}
                        />
                        <button
                          className="ml-2 px-2 py-1 bg-green-600 rounded hover:bg-green-500 text-white"
                          onClick={() => {
                            if (!newItemName) return;
                            setResultData(prev => ({
                              ...prev,
                              [newItemName]: { Quantity: newItemQuantity }
                            }));
                            setNewItemName('');
                            setNewItemQuantity(0);
                          }}
                        >
                          Add
                        </button>
                      </td>
                    </tr>
                    )}
                </tbody>
              </table>

              <div className="flex align-center justify-center mt-3">
                <button
                  onClick={() => setPage(prev => (prev === 0 ? totalPages - 1 : prev - 1))}
                  className="px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-600 mr-5"
                >
                  ← 
                </button>

                <span className="text-white">
                  Page {page + 1} of {totalPages}
                </span>

                <button
                  onClick={() => setPage(prev => (prev === totalPages - 1 ? 0 : prev + 1))}
                  className="px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-600 ml-5"
                >
                  →
                </button>
              </div>

              <div className = "flex flex-col items-center justify-center mt-20">
                <input
                  type="text"
                  placeholder="Enter any allergies you may have"
                  className="w-full bg-gray-700 text-white p-1 rounded"
                  value={allergyInput}
                  onChange={(e) => setAllergyInput(e.target.value)}
                >
                </input>

                <button 
                  onClick={() =>{
                    if (!resultData) return;
                    
                    setResultData(prevData => {
                      const updatedData = {
                        ...prevData,
                        Allergies: allergyInput
                      };
                      console.log("Updated Data:", updatedData);
                      return updatedData;
                    });
                    
                    setSentResults(true);
                  }}
                  className="px-4 py-2 w-1/4 bg-green-400 text-white rounded-lg hover:bg-green-600 font-titillium hover:scale-110 transition-all duration-300 mt-5"
                >
                  Search for Recipes
                </button>
              </div>

            </div>
          )}

          {!countLoad && !resultData && !sentResults && (
            <p className="text-white text-3xl mt-5 text-center">No items counted yet.</p>
          )}



      </div>
    </div>
  )
}

export default App
