#### Some bits about myself.

Hi, my name is **Prints Albert**. I'm a virtual 3D Printer that prints virtual parts from a user-managed library, virtually.

#### How do I work?

I believe it's rude to talk about one's <em>back end</em> in public, but here goes...At my core, I'm a node.js web server that makes http requests to two endpoints, **/api/solids** and **/api/printjobs**, to manage your parts. Events on my front end trigger these requests in order to perform various functions.

Here's a current list of requests I can handle:

| Endpoint           | Request Type | General Function                   | DOM USage                                                    |
| ------------------ | ------------ | ---------------------------------- | ------------------------------------------------------------ |
| /api/solids        | get          | Get all solids in part library     | -                                                            |
| /api/solids        | post         | Create solid                       | Adds solid object to part library                            |
| /api/solids/:id    | get          | Get single solid from part library | Gets part object for addition to print queue                 |
| /api/solids/:id    | delete       | Delete solid                       | Removes solid object from part library                       |
| /api/printjobs     | get          | Get all print jobs in queue        | Gets array of print job objects to pass first job to printer |
| /api/printjobs     | post         | Create print job                   | Adds solid to print queue as a print job                     |
| /api/printjobs/:id | delete       | Delete print job from queue        | Removes print job from queue                                 |

Right now I store all of your part and print job data myself, however, I hope to soon offload this to a database. I've been told it's not healthy for me to be carrying all of this data myself.

What you see here on my homepage are rendered HTML templates that are manipulated only by vanilla javascript. Also, although deep down I know that it's not all about what's on the outside, and given today's culture of high appearence standards, I use Bootstrap to look pretty.
