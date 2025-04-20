import React, { useEffect, useState } from 'react';
import * as mammoth from 'mammoth';

interface DocxViewerProps {
  url: string;
}

const DocxViewer: React.FC<DocxViewerProps> = ({ url }) => {
  const [html, setHtml] = useState<string>('');

  useEffect(() => {
    const fetchAndConvert = async () => {
      try {
        const res = await fetch(url);
        const arrayBuffer = await res.arrayBuffer();
        const { value } = await mammoth.convertToHtml({ arrayBuffer });
        setHtml(value);
      } catch (err) {
        console.error('DOCX conversion error', err);
      }
    };
    fetchAndConvert();
  }, [url]);

  return (
    <div className="docx-viewer overflow-auto prose">
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
};

export default DocxViewer;
