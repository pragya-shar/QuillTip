# Phase 2: Highlight System & Micro-Interaction Foundation (Weeks 5-7)

> **📝 Implementation Note**: This phase builds on the fresh Next.js 15 application created in Phase 1. All code examples assume a modern Next.js app directory structure, not the existing static HTML landing page.

## Overview

Implement QuillTip's unique highlight and selection system, enabling readers to interact with specific portions of text. This phase builds the foundation for the micro-tipping feature without payment integration.

## Goals

- Build precise text selection and highlighting system
- Implement highlight persistence and display
- Create comment/note system on highlights
- Develop heat map visualization showing popular highlights
- Add social features (likes, shares on highlights)

## Technical Requirements

### Frontend Enhancements

- **Selection Library**: Custom implementation using Selection API
- **Visualization**: D3.js for heat map rendering
- **Real-time Updates**: Socket.io for live highlight updates
- **Animation**: Framer Motion for smooth interactions
- **State Management**: Expand Zustand for highlight state

### Backend Extensions

- **WebSocket Server**: Socket.io integration
- **Database**: New tables for highlights and interactions
- **Caching**: Redis for real-time highlight data
- **Analytics**: Event tracking for engagement metrics

## User Stories

### Reader Stories

1. **As a reader**, I want to highlight text that resonates with me
   - Select any text portion (word, sentence, paragraph)
   - See visual feedback during selection
   - Save highlight with single click
   - View my highlight history

2. **As a reader**, I want to add notes to my highlights
   - Attach private/public notes
   - Edit/delete my notes
   - See notes in context

3. **As a reader**, I want to see what others highlighted
   - View heat map overlay
   - Toggle highlight visibility
   - Filter by popularity/recency
   - See highlight count per section

### Writer Stories

1. **As a writer**, I want to see engagement analytics
   - Most highlighted passages
   - Highlight trends over time
   - Reader engagement metrics
   - Export analytics data

2. **As a writer**, I want to understand reader interests
   - Word cloud of highlighted terms
   - Sentiment analysis of highlights
   - Demographic breakdown (anonymous)

## Database Schema Updates

```prisma
model Highlight {
  id              String    @id @default(cuid())
  articleId       String
  article         Article   @relation(fields: [articleId], references: [id])
  userId          String
  user            User      @relation(fields: [userId], references: [id])
  
  // Text selection data
  text            String    // The highlighted text
  startOffset     Int       // Character offset from start
  endOffset       Int       // Character offset from end
  startNode       String    // CSS selector for start node
  endNode         String    // CSS selector for end node
  
  // Metadata
  color           String?   @default("#FFE0B2")
  isPublic        Boolean   @default(true)
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  interactions    HighlightInteraction[]
  notes           HighlightNote[]
  
  @@index([articleId, userId])
  @@index([articleId, isPublic])
}

model HighlightNote {
  id              String    @id @default(cuid())
  highlightId     String
  highlight       Highlight @relation(fields: [highlightId], references: [id])
  content         String
  isPublic        Boolean   @default(false)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  @@index([highlightId])
}

model HighlightInteraction {
  id              String    @id @default(cuid())
  highlightId     String
  highlight       Highlight @relation(fields: [highlightId], references: [id])
  userId          String
  user            User      @relation(fields: [userId], references: [id])
  type            InteractionType
  createdAt       DateTime  @default(now())
  
  @@unique([highlightId, userId, type])
  @@index([highlightId])
}

enum InteractionType {
  LIKE
  SHARE
  REPORT
}

// Add to Article model
model Article {
  // ... existing fields
  highlights      Highlight[]
  highlightStats  Json?     // Cached stats for performance
}
```

## API Endpoints

### Highlights

- `POST /api/highlights` - Create new highlight
- `GET /api/highlights/article/[id]` - Get highlights for article
- `PUT /api/highlights/[id]` - Update highlight
- `DELETE /api/highlights/[id]` - Delete highlight
- `GET /api/highlights/user/[id]` - Get user's highlights

### Highlight Interactions

- `POST /api/highlights/[id]/like` - Like a highlight
- `POST /api/highlights/[id]/share` - Share a highlight
- `GET /api/highlights/[id]/stats` - Get highlight statistics

### Analytics

- `GET /api/analytics/article/[id]/highlights` - Article highlight analytics
- `GET /api/analytics/user/[id]/highlights` - User highlight patterns

### WebSocket Events

- `highlight:created` - New highlight added
- `highlight:deleted` - Highlight removed
- `highlight:liked` - Highlight liked
- `highlight:updated` - Highlight heat map update

## Technical Implementation

### Text Selection System

```typescript
interface TextSelection {
  text: string;
  range: Range;
  startContainer: Node;
  endContainer: Node;
  startOffset: number;
  endOffset: number;
}

class HighlightManager {
  // Capture precise text selection
  captureSelection(): TextSelection;
  
  // Convert selection to persistent format
  serializeSelection(selection: TextSelection): SerializedHighlight;
  
  // Restore highlight from saved data
  deserializeHighlight(data: SerializedHighlight): void;
  
  // Handle overlapping highlights
  mergeHighlights(highlights: Highlight[]): MergedHighlight[];
}
```

### Heat Map Visualization

```typescript
interface HeatMapData {
  paragraphId: string;
  intensity: number; // 0-1 based on highlight count
  highlights: number;
  uniqueUsers: number;
}

class HeatMapRenderer {
  // Generate heat map overlay
  renderHeatMap(data: HeatMapData[]): void;
  
  // Animate heat map transitions
  animateIntensityChange(oldData: HeatMapData[], newData: HeatMapData[]): void;
  
  // Interactive tooltips
  showHighlightDetails(paragraphId: string): void;
}
```

## UI/UX Components

### Highlight Interface

```
┌─────────────────────────────────────────────┐
│  Article Content                            │
│                                             │
│  This is some text that can be highlighted. │
│  [████████████████] ← Selected text        │
│  ┌─────────────────┐                       │
│  │ 💡 Add Note     │                       │
│  │ ❤️ Like         │                       │
│  │ 🔗 Share        │                       │
│  └─────────────────┘                       │
│                                             │
│  Previously highlighted text appears with   │
│  background color and count indicator [12] │
└─────────────────────────────────────────────┘
```

### Heat Map View

```
┌─────────────────────────────────────────────┐
│  [Toggle Heat Map] [Filter: All/Friends/Top]│
├─────────────────────────────────────────────┤
│                                             │
│  ░░░░ Low engagement paragraph             │
│  ▒▒▒▒ Medium engagement paragraph          │
│  ████ High engagement paragraph [45 highlights]
│                                             │
│  Hover for details:                         │
│  • 45 highlights by 23 readers             │
│  • Most recent: 2 hours ago                │
│  • Top highlighter: @username              │
└─────────────────────────────────────────────┘
```

### Analytics Dashboard

```
┌─────────────────────────────────────────────┐
│  Article Engagement Analytics               │
├─────────────────────────────────────────────┤
│  Total Highlights: 234                      │
│  Unique Readers: 89                         │
│  Engagement Rate: 67%                       │
│                                             │
│  Most Highlighted Passages:                 │
│  1. "This revolutionary approach..." (45)   │
│  2. "The key insight here is..." (38)      │
│  3. "In conclusion, we found..." (31)      │
│                                             │
│  [Export Data] [View Timeline]              │
└─────────────────────────────────────────────┘
```

## Performance Optimizations

### Client-Side

- Debounce selection events (100ms)
- Virtualize highlight list for articles with many highlights
- Lazy load heat map data
- Cache highlight positions

### Server-Side

- Redis cache for real-time highlight counts
- Batch WebSocket updates (100ms window)
- Database indexes on hot paths
- Pre-compute heat map data (5-minute intervals)

## Testing Requirements

### Unit Tests

- Text selection accuracy
- Highlight serialization/deserialization
- Overlap detection and merging
- Heat map calculations

### Integration Tests

- WebSocket highlight synchronization
- Multi-user highlight conflicts
- Analytics data accuracy

### E2E Tests

- Complete highlight flow: select → save → view
- Real-time updates across multiple sessions
- Heat map interactions

## Security Considerations

- Validate highlight boundaries to prevent XSS
- Rate limit highlight creation (10/minute per user)
- Sanitize highlight notes
- Privacy controls for highlight visibility

## Success Metrics

- **Highlight Creation Rate**: Highlights per article
- **Engagement Depth**: % of article highlighted
- **Social Interactions**: Likes/shares per highlight
- **Reader Retention**: Return rate for highlight users
- **Writer Satisfaction**: Analytics usage rate

## Dependencies & Risks

### Dependencies

- Browser Selection API compatibility
- WebSocket connection stability
- Real-time synchronization complexity

### Risks

- **Performance**: Many highlights could slow rendering
- **UX Complexity**: Feature discovery might be low
- **Privacy Concerns**: Users worried about tracked reading

### Mitigation Strategies

- Progressive rendering for large highlight sets
- Onboarding tutorial for highlight features
- Clear privacy options and data controls

## Migration Considerations

- No breaking changes to Phase 1
- Highlights table can be added without migration
- WebSocket server runs alongside existing API

## Next Phase Preparation

While building Phase 2, prepare for Phase 3 by:

- Researching Stellar SDK integration patterns
- Understanding Freighter wallet API
- Designing wallet connection UX
- Planning testnet faucet integration

## Detailed Implementation Plan

### Week 5: Foundation & Text Selection

#### Day 1-2: Database & WebSocket Setup

1. **Update Database Schema**

   ```bash
   npx prisma migrate dev --name add-highlights
   ```

2. **Setup Socket.io Server**

   ```typescript
   // server/socket.ts
   import { Server } from 'socket.io'
   import { createAdapter } from '@socket.io/redis-adapter'
   
   export const setupSocketServer = (httpServer) => {
     const io = new Server(httpServer, {
       cors: { origin: process.env.NEXT_PUBLIC_URL }
     })
     
     io.adapter(createAdapter(pubClient, subClient))
     return io
   }
   ```

3. **Redis Configuration**

   ```typescript
   // lib/redis.ts
   import { createClient } from 'redis'
   
   export const redis = createClient({
     url: process.env.REDIS_URL
   })
   ```

4. **Socket Context for React**

   ```typescript
   // contexts/SocketContext.tsx
   const SocketContext = createContext<Socket | null>(null)
   
   export const SocketProvider = ({ children }) => {
     const [socket, setSocket] = useState<Socket | null>(null)
     
     useEffect(() => {
       const newSocket = io()
       setSocket(newSocket)
       return () => { newSocket.close() }
     }, [])
     
     return (
       <SocketContext.Provider value={socket}>
         {children}
       </SocketContext.Provider>
     )
   }
   ```

#### Day 3-4: Text Selection System

1. **Selection Manager Implementation**

   ```typescript
   // lib/highlights/SelectionManager.ts
   export class SelectionManager {
     private container: HTMLElement
     private onSelection: (selection: TextSelection) => void
     
     constructor(container: HTMLElement, onSelection: (selection: TextSelection) => void) {
       this.container = container
       this.onSelection = onSelection
       this.setupListeners()
     }
     
     private setupListeners() {
       this.container.addEventListener('mouseup', this.handleMouseUp)
       this.container.addEventListener('touchend', this.handleTouchEnd)
     }
     
     private handleMouseUp = () => {
       const selection = window.getSelection()
       if (selection && selection.toString().trim()) {
         this.processSelection(selection)
       }
     }
     
     private processSelection(selection: Selection) {
       const range = selection.getRangeAt(0)
       const textSelection: TextSelection = {
         text: selection.toString(),
         range: range,
         startContainer: range.startContainer,
         endContainer: range.endContainer,
         startOffset: range.startOffset,
         endOffset: range.endOffset
       }
       this.onSelection(textSelection)
     }
     
     public clearSelection() {
       window.getSelection()?.removeAllRanges()
     }
   }
   ```

2. **Highlight Serialization**

   ```typescript
   // lib/highlights/HighlightSerializer.ts
   export class HighlightSerializer {
     static serialize(selection: TextSelection, articleId: string): SerializedHighlight {
       const startPath = this.getNodePath(selection.startContainer)
       const endPath = this.getNodePath(selection.endContainer)
       
       return {
         articleId,
         text: selection.text,
         startOffset: selection.startOffset,
         endOffset: selection.endOffset,
         startNode: startPath,
         endNode: endPath
       }
     }
     
     static deserialize(highlight: SerializedHighlight): Range | null {
       try {
         const startNode = this.getNodeFromPath(highlight.startNode)
         const endNode = this.getNodeFromPath(highlight.endNode)
         
         if (!startNode || !endNode) return null
         
         const range = document.createRange()
         range.setStart(startNode, highlight.startOffset)
         range.setEnd(endNode, highlight.endOffset)
         
         return range
       } catch (error) {
         console.error('Failed to deserialize highlight:', error)
         return null
       }
     }
     
     private static getNodePath(node: Node): string {
       const path: number[] = []
       let current = node
       
       while (current.parentNode) {
         const parent = current.parentNode
         const index = Array.from(parent.childNodes).indexOf(current as ChildNode)
         path.unshift(index)
         current = parent
       }
       
       return path.join('.')
     }
     
     private static getNodeFromPath(path: string): Node | null {
       const indices = path.split('.').map(Number)
       let current: Node = document.body
       
       for (const index of indices) {
         if (!current.childNodes[index]) return null
         current = current.childNodes[index]
       }
       
       return current
     }
   }
   ```

#### Day 5: Highlight UI Components

1. **Highlight Popover**

   ```typescript
   // components/highlights/HighlightPopover.tsx
   export const HighlightPopover = ({ selection, onAction }) => {
     const [position, setPosition] = useState({ x: 0, y: 0 })
     
     useEffect(() => {
       if (selection) {
         const rect = selection.range.getBoundingClientRect()
         setPosition({
           x: rect.left + rect.width / 2,
           y: rect.top - 40
         })
       }
     }, [selection])
     
     return (
       <AnimatePresence>
         {selection && (
           <motion.div
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: 10 }}
             style={{
               position: 'fixed',
               left: position.x,
               top: position.y,
               transform: 'translateX(-50%)'
             }}
             className="bg-white shadow-lg rounded-lg p-2 flex gap-2"
           >
             <button onClick={() => onAction('highlight')}>
               💡 Highlight
             </button>
             <button onClick={() => onAction('note')}>
               📝 Note
             </button>
             <button onClick={() => onAction('share')}>
               🔗 Share
             </button>
           </motion.div>
         )}
       </AnimatePresence>
     )
   }
   ```

2. **Highlight Renderer**

   ```typescript
   // components/highlights/HighlightRenderer.tsx
   export const HighlightRenderer = ({ highlights, articleContent }) => {
     useEffect(() => {
       highlights.forEach(highlight => {
         const range = HighlightSerializer.deserialize(highlight)
         if (range) {
           const span = document.createElement('span')
           span.className = 'highlight'
           span.dataset.highlightId = highlight.id
           span.style.backgroundColor = highlight.color || '#FFE0B2'
           
           try {
             range.surroundContents(span)
           } catch (error) {
             // Handle partial selections
             const contents = range.extractContents()
             span.appendChild(contents)
             range.insertNode(span)
           }
         }
       })
       
       return () => {
         // Cleanup highlights
         document.querySelectorAll('.highlight').forEach(el => {
           const parent = el.parentNode
           while (el.firstChild) {
             parent?.insertBefore(el.firstChild, el)
           }
           parent?.removeChild(el)
         })
       }
     }, [highlights])
     
     return <div dangerouslySetInnerHTML={{ __html: articleContent }} />
   }
   ```

### Week 6: Real-time Sync & Heat Map

#### Day 1-2: WebSocket Integration

1. **Highlight Events**

   ```typescript
   // hooks/useHighlightSync.ts
   export const useHighlightSync = (articleId: string) => {
     const socket = useSocket()
     const [highlights, setHighlights] = useState<Highlight[]>([])
     
     useEffect(() => {
       if (!socket) return
       
       // Join article room
       socket.emit('article:join', articleId)
       
       // Listen for highlight events
       socket.on('highlight:created', (highlight: Highlight) => {
         setHighlights(prev => [...prev, highlight])
       })
       
       socket.on('highlight:deleted', (highlightId: string) => {
         setHighlights(prev => prev.filter(h => h.id !== highlightId))
       })
       
       socket.on('highlight:updated', (highlight: Highlight) => {
         setHighlights(prev => prev.map(h => 
           h.id === highlight.id ? highlight : h
         ))
       })
       
       return () => {
         socket.emit('article:leave', articleId)
         socket.off('highlight:created')
         socket.off('highlight:deleted')
         socket.off('highlight:updated')
       }
     }, [socket, articleId])
     
     return highlights
   }
   ```

2. **Server-side Socket Handlers**

   ```typescript
   // server/socketHandlers.ts
   export const setupHighlightHandlers = (io: Server) => {
     io.on('connection', (socket) => {
       socket.on('article:join', async (articleId) => {
         socket.join(`article:${articleId}`)
         
         // Send existing highlights
         const highlights = await prisma.highlight.findMany({
           where: { articleId, isPublic: true },
           include: { user: true }
         })
         
         socket.emit('highlights:initial', highlights)
       })
       
       socket.on('highlight:create', async (data) => {
         const highlight = await prisma.highlight.create({
           data: {
             ...data,
             userId: socket.data.userId
           },
           include: { user: true }
         })
         
         io.to(`article:${data.articleId}`).emit('highlight:created', highlight)
         
         // Update cache
         await updateHighlightCache(data.articleId)
       })
     })
   }
   ```

#### Day 3-4: Heat Map Visualization

1. **Heat Map Calculator**

   ```typescript
   // lib/highlights/HeatMapCalculator.ts
   export class HeatMapCalculator {
     static calculateHeatMap(highlights: Highlight[]): HeatMapData[] {
       const paragraphMap = new Map<string, {
         highlights: number
         users: Set<string>
       }>()
       
       highlights.forEach(highlight => {
         const paragraphId = this.getParagraphId(highlight)
         const existing = paragraphMap.get(paragraphId) || {
           highlights: 0,
           users: new Set()
         }
         
         existing.highlights++
         existing.users.add(highlight.userId)
         paragraphMap.set(paragraphId, existing)
       })
       
       const maxHighlights = Math.max(...Array.from(paragraphMap.values())
         .map(p => p.highlights))
       
       return Array.from(paragraphMap.entries()).map(([paragraphId, data]) => ({
         paragraphId,
         intensity: data.highlights / maxHighlights,
         highlights: data.highlights,
         uniqueUsers: data.users.size
       }))
     }
     
     private static getParagraphId(highlight: Highlight): string {
       // Logic to determine which paragraph contains the highlight
       return `p-${highlight.startNode.split('.')[0]}`
     }
   }
   ```

2. **Heat Map Component**

   ```typescript
   // components/highlights/HeatMap.tsx
   export const HeatMap = ({ highlights, onToggle }) => {
     const [isVisible, setIsVisible] = useState(false)
     const [heatMapData, setHeatMapData] = useState<HeatMapData[]>([])
     
     useEffect(() => {
       if (isVisible) {
         const data = HeatMapCalculator.calculateHeatMap(highlights)
         setHeatMapData(data)
         renderHeatMap(data)
       } else {
         clearHeatMap()
       }
     }, [isVisible, highlights])
     
     const renderHeatMap = (data: HeatMapData[]) => {
       data.forEach(item => {
         const paragraph = document.getElementById(item.paragraphId)
         if (paragraph) {
           const overlay = document.createElement('div')
           overlay.className = 'heat-map-overlay'
           overlay.style.background = `rgba(255, 87, 34, ${item.intensity * 0.3})`
           overlay.style.position = 'absolute'
           overlay.style.inset = '0'
           overlay.style.pointerEvents = 'none'
           overlay.dataset.highlights = item.highlights.toString()
           
           paragraph.style.position = 'relative'
           paragraph.appendChild(overlay)
         }
       })
     }
     
     const clearHeatMap = () => {
       document.querySelectorAll('.heat-map-overlay').forEach(el => el.remove())
     }
     
     return (
       <div className="heat-map-controls">
         <button
           onClick={() => setIsVisible(!isVisible)}
           className="flex items-center gap-2"
         >
           <span>🔥</span>
           <span>Heat Map</span>
           <Switch checked={isVisible} />
         </button>
         
         {isVisible && (
           <div className="heat-map-legend">
             <span>Low</span>
             <div className="gradient-bar" />
             <span>High</span>
           </div>
         )}
       </div>
     )
   }
   ```

#### Day 5: Highlight Interactions

1. **Like/Share System**

   ```typescript
   // components/highlights/HighlightInteractions.tsx
   export const HighlightInteractions = ({ highlightId, initialLikes }) => {
     const [likes, setLikes] = useState(initialLikes)
     const [hasLiked, setHasLiked] = useState(false)
     const { mutate: toggleLike } = useMutation({
       mutationFn: () => api.post(`/highlights/${highlightId}/like`),
       onSuccess: (data) => {
         setLikes(data.likes)
         setHasLiked(data.hasLiked)
       }
     })
     
     const handleShare = async () => {
       const url = `${window.location.origin}/highlight/${highlightId}`
       if (navigator.share) {
         await navigator.share({
           title: 'Check out this highlight',
           url
         })
       } else {
         await navigator.clipboard.writeText(url)
         toast.success('Link copied!')
       }
     }
     
     return (
       <div className="flex gap-2">
         <button
           onClick={() => toggleLike()}
           className={`flex items-center gap-1 ${hasLiked ? 'text-red-500' : ''}`}
         >
           <Heart fill={hasLiked} />
           <span>{likes}</span>
         </button>
         
         <button onClick={handleShare}>
           <Share2 />
         </button>
       </div>
     )
   }
   ```

2. **Note System**

   ```typescript
   // components/highlights/HighlightNote.tsx
   export const HighlightNote = ({ highlightId, onSave }) => {
     const [isOpen, setIsOpen] = useState(false)
     const [note, setNote] = useState('')
     const [isPublic, setIsPublic] = useState(false)
     
     const { mutate: saveNote } = useMutation({
       mutationFn: (data) => api.post(`/highlights/${highlightId}/notes`, data),
       onSuccess: () => {
         setIsOpen(false)
         onSave?.()
       }
     })
     
     return (
       <Dialog open={isOpen} onOpenChange={setIsOpen}>
         <DialogTrigger asChild>
           <button>📝 Add Note</button>
         </DialogTrigger>
         <DialogContent>
           <DialogHeader>
             <DialogTitle>Add a note to your highlight</DialogTitle>
           </DialogHeader>
           
           <textarea
             value={note}
             onChange={(e) => setNote(e.target.value)}
             placeholder="What are your thoughts?"
             className="w-full h-32 p-2 border rounded"
           />
           
           <div className="flex items-center gap-2">
             <Switch
               checked={isPublic}
               onCheckedChange={setIsPublic}
             />
             <label>Make this note public</label>
           </div>
           
           <DialogFooter>
             <button onClick={() => saveNote({ content: note, isPublic })}>
               Save Note
             </button>
           </DialogFooter>
         </DialogContent>
       </Dialog>
     )
   }
   ```

### Week 7: Analytics & Polish

#### Day 1-2: Analytics Dashboard

1. **Writer Analytics Page**

   ```typescript
   // app/dashboard/analytics/page.tsx
   export default function AnalyticsPage() {
     const { data: articles } = useQuery({
       queryKey: ['writer-articles'],
       queryFn: () => api.get('/articles/mine')
     })
     
     return (
       <div className="analytics-dashboard">
         <h1>Engagement Analytics</h1>
         
         <div className="grid grid-cols-3 gap-4">
           <MetricCard
             title="Total Highlights"
             value={articles?.totalHighlights}
             change="+12%"
           />
           <MetricCard
             title="Unique Readers"
             value={articles?.uniqueReaders}
             change="+5%"
           />
           <MetricCard
             title="Engagement Rate"
             value={`${articles?.engagementRate}%`}
             change="+3%"
           />
         </div>
         
         <ArticleHighlightsList articles={articles?.data} />
       </div>
     )
   }
   ```

2. **Highlight Analytics Component**

   ```typescript
   // components/analytics/HighlightAnalytics.tsx
   export const HighlightAnalytics = ({ articleId }) => {
     const { data } = useQuery({
       queryKey: ['highlight-analytics', articleId],
       queryFn: () => api.get(`/analytics/article/${articleId}/highlights`)
     })
     
     return (
       <div className="highlight-analytics">
         <h3>Most Highlighted Passages</h3>
         <div className="space-y-4">
           {data?.topHighlights.map((highlight, index) => (
             <div key={highlight.id} className="highlight-item">
               <div className="flex justify-between">
                 <span className="font-bold">#{index + 1}</span>
                 <span className="text-sm text-gray-500">
                   {highlight.count} highlights
                 </span>
               </div>
               <blockquote className="text-gray-700 italic">
                 "{highlight.text}"
               </blockquote>
             </div>
           ))}
         </div>
         
         <HighlightTimeline data={data?.timeline} />
         <HighlightWordCloud data={data?.wordFrequency} />
       </div>
     )
   }
   ```

#### Day 3-4: Performance Optimization

1. **Highlight Caching**

   ```typescript
   // lib/cache/highlightCache.ts
   export class HighlightCache {
     static async getArticleHighlights(articleId: string): Promise<Highlight[]> {
       const cached = await redis.get(`highlights:${articleId}`)
       if (cached) return JSON.parse(cached)
       
       const highlights = await prisma.highlight.findMany({
         where: { articleId, isPublic: true },
         include: { user: true }
       })
       
       await redis.setex(
         `highlights:${articleId}`,
         300, // 5 minutes
         JSON.stringify(highlights)
       )
       
       return highlights
     }
     
     static async invalidate(articleId: string) {
       await redis.del(`highlights:${articleId}`)
       await redis.del(`heatmap:${articleId}`)
     }
   }
   ```

2. **Virtualized Highlight List**

   ```typescript
   // components/highlights/VirtualizedHighlightList.tsx
   import { FixedSizeList } from 'react-window'
   
   export const VirtualizedHighlightList = ({ highlights }) => {
     const Row = ({ index, style }) => (
       <div style={style}>
         <HighlightItem highlight={highlights[index]} />
       </div>
     )
     
     return (
       <FixedSizeList
         height={600}
         itemCount={highlights.length}
         itemSize={80}
         width="100%"
       >
         {Row}
       </FixedSizeList>
     )
   }
   ```

#### Day 5: Testing & Documentation

1. **E2E Tests**

   ```typescript
   // cypress/e2e/highlights.cy.ts
   describe('Highlight System', () => {
     it('should create and display highlights', () => {
       cy.login()
       cy.visit('/article/test-article')
       
       // Select text
       cy.get('.article-content p').first()
         .trigger('mousedown', { which: 1 })
         .trigger('mousemove', { clientX: 100 })
         .trigger('mouseup')
       
       // Click highlight button
       cy.get('[data-testid="highlight-button"]').click()
       
       // Verify highlight appears
       cy.get('.highlight').should('exist')
       
       // Verify real-time sync
       cy.window().its('socket').invoke('emit', 'highlight:created')
       cy.get('.highlight').should('have.length', 2)
     })
     
     it('should display heat map', () => {
       cy.visit('/article/popular-article')
       cy.get('[data-testid="heat-map-toggle"]').click()
       cy.get('.heat-map-overlay').should('exist')
     })
   })
   ```

2. **API Documentation**

   ```typescript
   // docs/api/highlights.md
   /**
    * @api {post} /api/highlights Create Highlight
    * @apiName CreateHighlight
    * @apiGroup Highlights
    * 
    * @apiParam {String} articleId Article ID
    * @apiParam {String} text Selected text
    * @apiParam {Number} startOffset Start position
    * @apiParam {Number} endOffset End position
    * @apiParam {String} startNode Start node selector
    * @apiParam {String} endNode End node selector
    * 
    * @apiSuccess {Object} highlight Created highlight object
    */
   ```

### Deployment Checklist

- [ ] Redis cluster configured
- [ ] WebSocket server deployed
- [ ] Database indexes added
- [ ] Caching layer tested
- [ ] Real-time sync verified
- [ ] Heat map performance optimized
- [ ] Analytics endpoints secured
- [ ] Rate limiting configured

### Performance Benchmarks

- Highlight creation: < 100ms
- Heat map rendering: < 200ms
- WebSocket latency: < 50ms
- Analytics query: < 500ms

## Implementation Checklist

### Week 5: Foundation & Text Selection

#### Day 1-2: Database & WebSocket Setup

- [x] Update Prisma schema with Highlight model -- M --
- [ ] Update Prisma schema with HighlightNote model -- W --
- [ ] Update Prisma schema with HighlightInteraction model -- S --
- [x] Add InteractionType enum (LIKE, SHARE, REPORT) -- S --
- [x] Update Article model with highlights relation -- M --
- [ ] Add highlightStats JSON field to Article model -- W --
- [x] Create and run database migrations -- M --
- [x] Test database schema changes -- M --
- [ ] Install Socket.io dependencies -- W --
- [ ] Install Redis client dependencies -- W --
- [ ] Configure Redis connection in lib/redis.ts -- W --
- [ ] Create Socket.io server setup (server/socket.ts) -- W --
- [ ] Configure CORS for WebSocket connections -- W --
- [ ] Set up Redis adapter for Socket.io -- C --
- [ ] Create Socket context provider for React -- W --
- [ ] Add WebSocket connection to app layout -- W --
- [ ] Test WebSocket connection establishment -- W --
- [ ] Configure environment variables for Redis -- W --
- [ ] Set up Redis caching strategies -- S --
- [ ] Create cache invalidation utilities -- S --

#### Day 3-4: Text Selection System

- [x] Create SelectionManager class -- M --
- [x] Implement mouse event handlers for text selection -- M --
- [x] Implement touch event handlers for mobile selection -- M --
- [x] Create TextSelection interface and types -- M --
- [x] Implement selection range capture logic -- M --
- [x] Add selection clearing functionality -- M --
- [x] Create HighlightSerializer class -- M --
- [x] Implement serialize method for selections -- M --
- [x] Implement deserialize method for highlights -- M --
- [x] Create node path generation utilities -- M --
- [x] Create node path resolution utilities -- M --
- [ ] Handle text node selection edge cases -- S --
- [ ] Handle partial element selections -- S --
- [x] Implement selection validation logic -- M --
- [ ] Add selection boundary checks -- S --
- [ ] Create selection debouncing logic -- S --
- [ ] Test cross-browser selection compatibility -- S --
- [ ] Add selection visual feedback -- C --
- [ ] Implement selection size limits -- C --
- [x] Create selection persistence utilities -- M --

#### Day 5: Highlight UI Components

- [ ] Create HighlightPopover component -- M --
- [ ] Implement popover positioning logic -- M --
- [ ] Add popover animation with Framer Motion -- C --
- [ ] Create highlight action buttons (highlight, note, share) -- M --
- [ ] Style popover with Tailwind CSS -- S --
- [ ] Create HighlightRenderer component -- M --
- [ ] Implement highlight span creation -- M --
- [ ] Add highlight color customization -- C --
- [ ] Handle overlapping highlights rendering -- S --
- [ ] Implement highlight cleanup on unmount -- M --
- [ ] Create highlight hover effects -- C --
- [ ] Add highlight click handlers -- S --
- [ ] Create highlight tooltip component -- C --
- [ ] Implement highlight count indicators -- S --
- [ ] Add highlight selection state management -- M --
- [ ] Create highlight context menu -- C --
- [ ] Test highlight rendering performance -- S --
- [ ] Add accessibility attributes to highlights -- S --
- [ ] Create highlight loading states -- C --
- [ ] Implement highlight error handling -- S --

### Week 6: Real-time Sync & Heat Map

#### Day 1-2: WebSocket Integration

- [ ] Create useHighlightSync hook -- W --
- [ ] Implement article room joining logic -- W --
- [ ] Add highlight:created event listener -- W --
- [ ] Add highlight:deleted event listener -- W --
- [ ] Add highlight:updated event listener -- S --
- [ ] Create initial highlights fetch logic -- W --
- [ ] Implement optimistic UI updates -- S --
- [ ] Add connection error handling -- S --
- [ ] Create reconnection logic -- S --
- [ ] Implement event batching for performance -- W --
- [ ] Create server-side socket handlers -- W --
- [ ] Implement article:join handler -- W --
- [ ] Implement highlight:create handler -- W --
- [ ] Add user authentication to socket events -- W --
- [ ] Create highlight broadcast logic -- W --
- [ ] Update cache on highlight changes -- S --
- [ ] Add rate limiting for socket events -- S --
- [ ] Create socket event validation -- S --
- [ ] Test real-time sync across multiple clients -- W --
- [ ] Add socket connection status indicator -- C --

#### Day 3-4: Heat Map Visualization

- [ ] Create HeatMapCalculator class -- M --
- [ ] Implement highlight aggregation logic -- M --
- [ ] Calculate intensity values per paragraph -- M --
- [ ] Create paragraph identification utilities -- M --
- [ ] Track unique users per highlight -- S --
- [ ] Create HeatMap React component -- M --
- [ ] Implement heat map toggle functionality -- M --
- [ ] Create heat map overlay rendering -- M --
- [ ] Add intensity-based coloring -- M --
- [ ] Implement heat map animations -- C --
- [ ] Create heat map legend component -- S --
- [ ] Add heat map filtering options -- S --
- [ ] Create heat map tooltip with stats -- S --
- [ ] Implement progressive heat map loading -- C --
- [ ] Add heat map caching logic -- S --
- [ ] Create heat map refresh mechanism -- S --
- [ ] Test heat map performance with many highlights -- S --
- [ ] Add mobile-responsive heat map -- S --
- [ ] Create heat map export functionality -- W --
- [ ] Implement heat map sharing features -- W --

#### Day 5: Highlight Interactions

- [ ] Create HighlightInteractions component -- W --
- [ ] Implement like functionality -- W --
- [ ] Create like toggle mutation -- W --
- [ ] Add optimistic like updates -- C --
- [ ] Implement share functionality -- W --
- [ ] Add native share API support -- S --
- [ ] Create fallback clipboard copy -- S --
- [ ] Generate shareable highlight URLs -- W --
- [ ] Create HighlightNote component -- W --
- [ ] Build note dialog/modal -- W --
- [ ] Implement note saving mutation -- W --
- [ ] Add public/private note toggle -- S --
- [ ] Create note editing functionality -- S --
- [ ] Add note deletion capability -- S --
- [ ] Display existing notes -- M --
- [ ] Create note thread/reply system -- W --
- [ ] Add note markdown support -- W --
- [ ] Implement note character limits -- S --
- [ ] Create note notification system -- W --
- [ ] Test interaction responsiveness -- S --

### Week 7: Analytics & Polish

#### Day 1-2: Analytics Dashboard

- [ ] Create analytics page layout -- M --
- [ ] Build MetricCard component -- S --
- [ ] Implement total highlights metric -- M --
- [ ] Add unique readers metric -- M --
- [ ] Calculate engagement rate metric -- M --
- [ ] Create article highlights list -- M --
- [ ] Build HighlightAnalytics component -- M --
- [ ] Display most highlighted passages -- M --
- [ ] Create highlight timeline chart -- S --
- [ ] Build highlight word cloud -- W --
- [ ] Add analytics data export -- S --
- [ ] Create analytics API endpoints -- M --
- [ ] Implement analytics caching -- S --
- [ ] Add date range filtering -- S --
- [ ] Create comparative analytics -- W --
- [ ] Build highlight trend analysis -- C --
- [ ] Add demographic breakdowns -- W --
- [ ] Create engagement heatmap calendar -- W --
- [ ] Implement real-time analytics updates -- W --
- [ ] Add analytics sharing capabilities -- W --

#### Day 3-4: Performance Optimization

- [ ] Create HighlightCache class -- M --
- [ ] Implement Redis caching for highlights -- M --
- [ ] Add cache expiration logic -- M --
- [ ] Create cache invalidation methods -- M --
- [ ] Implement cache warming strategies -- W --
- [ ] Build VirtualizedHighlightList component -- S --
- [ ] Implement react-window for long lists -- S --
- [ ] Add lazy loading for highlights -- S --
- [ ] Optimize WebSocket message batching -- S --
- [ ] Implement debouncing for selection events -- M --
- [ ] Add request deduplication -- C --
- [ ] Create database query optimization -- S --
- [ ] Add database indexes for highlight queries -- M --
- [ ] Implement connection pooling -- S --
- [ ] Optimize heat map calculations -- S --
- [ ] Add CDN caching for static assets -- C --
- [ ] Implement service worker caching -- W --
- [ ] Create performance monitoring -- S --
- [ ] Add performance budgets -- C --
- [ ] Test and optimize bundle size -- S --

#### Day 5: Testing & Documentation

- [ ] Write unit tests for SelectionManager -- M --
- [ ] Write unit tests for HighlightSerializer -- M --
- [ ] Test highlight overlap detection -- S --
- [ ] Test heat map calculations -- S --
- [ ] Write integration tests for WebSocket sync -- M --
- [ ] Test multi-user highlight conflicts -- S --
- [ ] Test analytics data accuracy -- S --
- [ ] Create E2E test for highlight creation flow -- M --
- [ ] Create E2E test for heat map display -- S --
- [ ] Test real-time sync across sessions -- M --
- [ ] Write API documentation for highlights -- M --
- [ ] Document WebSocket event protocols -- S --
- [ ] Create user guide for highlighting features -- S --
- [ ] Document performance benchmarks -- C --
- [ ] Add inline code documentation -- S --
- [ ] Create troubleshooting guide -- C --
- [ ] Write deployment documentation -- S --
- [ ] Create feature flag documentation -- C --
- [ ] Add accessibility documentation -- S --
- [ ] Create migration guide from Phase 1 -- S --

### Post-Implementation Tasks

- [ ] Conduct security audit for XSS vulnerabilities -- M --
- [ ] Implement rate limiting for highlight creation -- M --
- [ ] Add input sanitization for notes -- M --
- [ ] Configure privacy controls -- S --
- [ ] Set up monitoring for WebSocket connections -- S --
- [ ] Create alert rules for system health -- S --
- [ ] Implement backup strategy for highlights -- S --
- [ ] Plan Phase 3 Stellar integration -- M --
- [ ] Research Freighter wallet API -- S --
- [ ] Design wallet connection UX -- S --
- [ ] Set up testnet environment -- C --
- [ ] Create feature toggles for gradual rollout -- S --
- [ ] Implement A/B testing framework -- C --
- [ ] Gather user feedback on highlighting UX -- S --
- [ ] Create highlight feature onboarding -- S --

## MoSCoW Priority Summary

### Task Distribution

| Priority | Count | Percentage |
|----------|-------|------------|
| **M (Must have)** | 57 | 29.23% |
| **S (Should have)** | 72 | 36.92% |
| **C (Could have)** | 22 | 11.28% |
| **W (Won't have)** | 44 | 22.56% |
| **TOTAL** | **195** | **100%** |
