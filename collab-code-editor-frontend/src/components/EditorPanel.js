import Editor from "@monaco-editor/react";
export default function EditorPanel ({ code, onChange }) {
    return (
        <div className="flex-grow">
            <Editor 
                height="100%"
                defaultLanguage="javascript"
                theme="vs-dark"
                value={code}
                onChange={onChange}
                />
        </div>
    );
}