import { useEffect, useState } from 'react';


const useIn = stream => {
  const [data, setData] = useState(null);
  useEffect(() => {
    const onData = data => setData(data);
    const sub = stream.subscribe(onData);
    return () => sub.unsubscribe();
  }, [stream]);
};

const Streamy1 = ({ input }) => {
  const inStream = useIn(input);
};
