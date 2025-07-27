import Quill from "quill";
import {useEffect, useRef,useState} from "react";

interface RendererProps {
    value: string;
}

const Renderer = ({ value }: RendererProps) => {
    const [isEmpty, setIsEmpty] = useState(false);
    const rendererRef = useRef<HTMLDivElement>(null);  

    useEffect(() => {
        if (!rendererRef.current) {
            return;
        }
        const conatainer = rendererRef.current;
        const quill = new Quill(document.createElement("div"), {
            theme: "snow",

        });
        quill.enable(false);
        const contents = JSON.parse(value);
        quill.setContents(contents);
        const isEmpty = quill.getText().replace(/<(.|\n)*?>/g,"").trim().length==0;
        setIsEmpty(isEmpty);
        conatainer.innerHTML = quill.root.innerHTML;
        return () => {
            if(conatainer)
            {
                conatainer.innerHTML="";
            }
        };

    }, [value]);
    if(isEmpty) return null;
    return  <div ref={rendererRef} className="ql-editor ql-renderer" />

 
}
export default Renderer;
