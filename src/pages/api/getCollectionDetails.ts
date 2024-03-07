import prisma from "../../../prisma_client"; 

export default async function handler(req: any, res: any) {
  if (req.method === 'GET') {
    const collectionId = parseInt(req.query.collectionId as string, 10);

    try {
      const collection = await prisma.collection.findUnique({
        where: {
          id: collectionId,
        },
        select: {
          title: true, // Only fetch the title
        },
      });

      if (collection) {
        console.log("CALLED: /getCollectionDetails"); 
        return res.status(200).json(collection);
      } else {
        return res.status(404).json({ error: 'Collection not found' });
      }
    } catch (error) {
      console.error('Failed to fetch collection details:', error);
      return res.status(500).json({ error: 'Failed to fetch collection details' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}