import Link from 'next/link';
import Band from '@/components/band';

export default function NotFound() {
  return (
    <>
      <Band eyebrow="Wrong turn" title="Off Route" sub="That page isn't on any of our routes." />
      <div className="wrap content" style={{ textAlign: 'center' }}>
        <Link className="btn dark" href="/">
          Back to the start line
        </Link>
      </div>
    </>
  );
}
