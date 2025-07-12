import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import socket from './socket';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import ConsolePanel from './components/ConsolePanel';
import axios from 'axios';

const EditorPage = () => {
  const { id: documentId } = useParams();
  const editorRef = useRef(null);
  const [username, setUsername] = useState('');
  const [connectedUsers, setConnectedUsers] = useState([]);

  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [output, setOutput] = useState('');
  const [openTabs, setOpenTabs] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [ typingUser, setTypingUser ] = useState('');
 

  // --------------------------- USER JOIN --------------------------
  useEffect(() => {
    const name = prompt('Enter your name:');
    const finalName = name || 'Anonymous';
    setUsername(finalName);

    socket.emit('join-document', { documentId, username: finalName });

    socket.on('update-user-list', (users) => {
      setConnectedUsers(users);
    });

    socket.on('load-files', (sharedFiles) => {
    setFiles(sharedFiles);
    if (sharedFiles.length > 0) {
      setSelectedFile(sharedFiles[0].name);
      setActiveTab(sharedFiles[0].name);
      setOpenTabs([sharedFiles[0].name]);
    }
  });

    return () => {
      socket.off('update-user-list');
      socket.off('load-list');
    };
  }, [documentId]);

  // --------------------------- SYNC CODE --------------------------
  useEffect(() => {
  socket.on('receive-changes', ({ fileName, content, sender }) => {
  if (sender === socket.id) return;
  setFiles((prev) =>
    prev.map((file) =>
      file.name === fileName ? { ...file, content } : file
    )
  );
});


  socket.on('user-typing', (username) => {
    setTypingUser(username);
    setTimeout(() => setTypingUser(''), 3000);
  });

  const interval = setInterval(() => {
    if (editorRef.current) {
      const code = editorRef.current.getValue();
      socket.emit('save-document', code);
    }
  }, 2000);

  return () => {
    socket.off('receive-changes');
    socket.off('user-typing');
    clearInterval(interval);
  };
}, []);


useEffect(() => {
  socket.on('new-file', ({ file }) => {
    setFiles((prev) => {
      const exists = prev.find((f) => f.name === file.name);
      if (exists) return prev;
      return [...prev, file];
    });
  });

  return () => {
    socket.off('new-file');
  };
}, []);



  // --------------------------- FILE MANAGEMENT --------------------------
  const handleFileAdd = (name, language) => {
    const exists = files.find((f) => f.name === name);
    if (!exists) {
      const newFile = { name, language, content: '' };
      setFiles([...files, newFile]);
      setSelectedFile(name);
      setActiveTab(name);
      setOpenTabs((prev) => [...prev, name]);

      socket.emit('new-file', { documentId, file: newFile });
    } else {
      alert('File with that name already exists.');
    }
  };

  const handleFileSelect = (name) => {
    setSelectedFile(name);
    setActiveTab(name);
    if (!openTabs.includes(name)) {
      setOpenTabs((prev) => [...prev, name]);
    }
  };

  // --------------------------- CODE CHANGE --------------------------
  const handleEditorChange = (value) => {

    const fileName = selectedFile;
    socket.emit('typing', { documentId, username });
    socket.emit('send-changes',{ documentId, fileName, content: value, sender: socket.id} );
    
    setFiles((prev) =>
      prev.map((file) =>
        file.name === fileName ? { ...file, content: value } : file
      )
    );
  };

  // --------------------------- RUN CODE --------------------------
  const runCode = async () => {
    const currentFile = files.find((f) => f.name === activeTab);
    if (!currentFile) return;

    try {
      const res = await axios.post('http://localhost:5000/run', {
        language: currentFile.language,
        code: currentFile.content,
      });
      setOutput(res.data.output || res.data.error || 'No output');
    } catch (err) {
      console.error('Run error: ', err);
      setOutput('❌ Error running code');
    }
  };

  // --------------------------- UI --------------------------
  const currentTabFile = files.find((f) => f.name === activeTab);

  return (
    <div className="h-screen w-screen overflow-hidden bg-gray-100">
      <PanelGroup direction="horizontal" className="h-full w-full">
        {/* Sidebar Panel */}
        <Panel defaultSize={20} minSize={15}>
          <div className="h-full w-full">
            <Sidebar
              files={files}
              onFileAdd={handleFileAdd}
              onFileSelect={handleFileSelect}
              selectedFile={selectedFile}
              connectedUsers={connectedUsers}
            />
          </div>
        </Panel>
        <PanelResizeHandle className="bg-gray-300 w-1 cursor-col-resize" />

        {/* Main Area */}
        <Panel defaultSize={80} minSize={50}>
          <div className="flex flex-col h-full w-full">
            <Topbar username={username} runCode={runCode} selectedFile={selectedFile} typingUser={typingUser}/>
            
            {/* Tab Bar */}
           <div className="flex bg-gray-800 text-white text-sm">
  {openTabs.map((file) => (
    <div
      key={file}
      className={`flex items-center px-3 py-2 border-r border-gray-600 ${
        activeTab === file ? 'bg-gray-700 font-semibold' : 'hover:bg-gray-700'
      }`}
    >
      <button onClick={() => setActiveTab(file)}>{file}</button>
      <button
        onClick={(e) => {
          e.stopPropagation(); // avoid triggering setActiveTab
          setOpenTabs((prev) => prev.filter((tab) => tab !== file));
          if (activeTab === file) {
            const otherTabs = openTabs.filter((t) => t !== file);
            setActiveTab(otherTabs[0] || null);
            setSelectedFile(otherTabs[0] || null);
          }
        }}
        className="ml-2 text-gray-300 hover:text-red-400"
      >
        ×
      </button>
    </div>
  ))}
</div>


            <PanelGroup direction="vertical" className="flex-grow w-full">
              {/* Editor Panel */}
              <Panel defaultSize={70} minSize={40}>
                <div className="h-full w-full">
                  <Editor
                    height="100%"
                    width="100%"
                    theme="vs-dark"
                    language={currentTabFile?.language || 'javascript'}
                    value={currentTabFile?.content || ''}
                    onChange={handleEditorChange}
                    onMount={(editor) => (editorRef.current = editor)}
                  />
                </div>
              </Panel>
              <PanelResizeHandle className="h-2 bg-gray-300 cursor-row-resize" />

              {/* Console Panel */}
              <Panel defaultSize={30} minSize={10}>
                <div className="h-full w-full">
                  <ConsolePanel output={output} />
                </div>
              </Panel>
            </PanelGroup>
          </div>
        </Panel>
      </PanelGroup>
    </div>
  );
};

export default EditorPage;
