import { Activity } from './types';

/**
 * Creates a default activity of the specified type with sensible defaults.
 * Used when adding new activities to a course section.
 *
 * @param type - The type of activity to create
 * @param order - The order position of the activity within the section
 * @returns A new Activity with default values
 */
export function createDefaultActivity(type: Activity['type'], order: number): Activity {
  const id = `activity-${Date.now()}`;

  switch (type) {
    case 'text_content':
      return { id, type, order, content: '<p>Enter your content here...</p>' };
    case 'knowledge_check':
      return {
        id,
        type,
        order,
        question: 'Your question here?',
        options: [
          { id: 'opt1', text: 'Option 1', correct: false },
          { id: 'opt2', text: 'Option 2', correct: true },
        ],
      };
    case 'flashcard':
      return {
        id,
        type,
        order,
        cards: [{ id: 'card1', front: 'Term', back: 'Definition' }],
      };
    case 'sorting':
      return {
        id,
        type,
        order,
        title: 'Sort the items',
        categories: [
          { id: 'cat1', title: 'Category 1' },
          { id: 'cat2', title: 'Category 2' },
        ],
        items: [
          { id: 'item1', text: 'Item 1', categoryId: 'cat1' },
          { id: 'item2', text: 'Item 2', categoryId: 'cat2' },
        ],
      };
    case 'process':
      return {
        id,
        type,
        order,
        steps: [
          { id: 'step1', title: 'Step 1', content: 'Description of step 1' },
          { id: 'step2', title: 'Step 2', content: 'Description of step 2' },
        ],
      };
    case 'image':
      return { id, type, order, src: '', alt: 'Image description' };
    case 'infographic':
      return { id, type, order, src: '', alt: 'Infographic description', title: '', infographicPrompt: '' };
    case 'youtube':
      return { id, type, order, videoId: '' };
    case 'interactive_video':
      return {
        id,
        type,
        order,
        videoId: '',
        checkpoints: [],
        required: false,
        preventSkipping: false
      };
    case 'pdf':
      return { id, type, order, pdfUrl: '', title: 'Document' };
    case 'info_panel':
      return { id, type, order, title: 'Important', content: 'Info here', variant: 'info' };
    case 'accordion':
      return {
        id,
        type,
        order,
        sections: [{ id: 'acc1', title: 'Section 1', content: 'Content here' }],
      };
    case 'code_snippet':
      return { id, type, order, language: 'javascript', code: '// Your code here' };
    case 'hotspot':
      return { id, type, order, imageUrl: '', hotspots: [] };
    case 'matching':
      return {
        id,
        type,
        order,
        title: 'Match the pairs',
        pairs: [
          { id: 'pair1', left: 'Apple', right: 'Fruit' },
          { id: 'pair2', left: 'Carrot', right: 'Vegetable' },
        ],
      };
    case 'sequence':
      return {
        id,
        type,
        order,
        title: 'Order the steps',
        items: [
          { id: 'item1', text: 'First Step', order: 0 },
          { id: 'item2', text: 'Second Step', order: 1 },
          { id: 'item3', text: 'Third Step', order: 2 },
        ],
      };
    case 'quiz':
      return {
        id,
        type,
        order,
        title: 'Final Quiz',
        description: 'Test your knowledge with this final quiz.',
        timeLimit: 300, // 5 minutes
        passingScore: 80,
        questions: [
          {
            id: 'q1',
            text: 'What is the answer?',
            points: 10,
            options: [
              { id: 'o1', text: 'Answer A', correct: true },
              { id: 'o2', text: 'Answer B', correct: false },
            ]
          }
        ]
      };
    case 'gamification':
      return {
        id,
        type,
        order,
        gameType: 'memory_match',
        config: {
          penaltyShuffle: true,
          pairs: [
            {
              id: `pair-${Date.now()}`,
              item1: { type: 'text', content: 'Term' },
              item2: { type: 'text', content: 'Definition' },
              info: 'Explanation'
            }
          ]
        }
      };
    // New content blocks
    case 'tabs':
      return {
        id,
        type,
        order,
        tabs: [
          { id: 'tab1', title: 'Tab 1', icon: '', content: '<p>Content for tab 1...</p>' },
          { id: 'tab2', title: 'Tab 2', icon: '', content: '<p>Content for tab 2...</p>' },
        ],
      };
    case 'timeline':
      return {
        id,
        type,
        order,
        title: 'Timeline',
        events: [
          { id: 'event1', title: 'Event 1', date: '2024', content: '<p>Description...</p>', icon: '', image: '' },
          { id: 'event2', title: 'Event 2', date: '2025', content: '<p>Description...</p>', icon: '', image: '' },
        ],
      };
    case 'button':
      return {
        id,
        type,
        order,
        alignment: 'center',
        buttons: [
          { id: 'btn1', text: 'Learn More', url: '#', variant: 'primary', size: 'medium', icon: '', openInNewTab: false },
        ],
      };
    case 'audio':
      return {
        id,
        type,
        order,
        src: '',
        title: 'Audio Title',
        description: '',
        transcript: '',
        downloadable: false,
      };
    case 'gallery':
      return {
        id,
        type,
        order,
        title: '',
        layout: 'carousel',
        images: [
          { id: 'img1', src: '', alt: '', caption: '' },
        ],
      };
    case 'divider':
      return {
        id,
        type,
        order,
        style: 'gradient',
        label: '',
        height: 48,
      };
    case 'embed':
      return {
        id,
        type,
        order,
        url: '',
        embedCode: '',
        title: '',
        caption: '',
      };
    case 'model_viewer':
      return {
        id,
        type,
        order,
        modelUrl: '',
        title: '3D Model',
        caption: '',
        autoRotate: true,
        cameraControls: true,
        ar: false,
        backgroundColor: '#1a1a2e',
      };
    case 'branching_scenario':
      return {
        id,
        type,
        order,
        title: 'New Scenario',
        description: 'Interactive decision-making scenario',
        nodes: [
          {
            id: 'node-start',
            type: 'start',
            title: 'Introduction',
            content: '<p>Welcome to the scenario. Click continue to begin.</p>',
            position: { x: 50, y: 50 }
          }
        ],
        startNodeId: 'node-start',
        required: false,
      };
    case 'screen_recording':
      return {
        id,
        type,
        order,
        title: 'New Screen Recording',
        driveFileId: '',
      };
    case 'live':
      return {
        id,
        type,
        order,
        activityType: 'poll',
        question: 'New Live Poll',
        options: [
          { id: 'opt1', text: 'Yes' },
          { id: 'opt2', text: 'No' }
        ],
        config: {
          showResults: true
        }
      };
    case 'fill_in_blank':
      return {
        id,
        type,
        order,
        instruction: 'Fill in the blanks to complete the text',
        text: 'The {0} is an important concept that relates to {1}.',
        blanks: [
          { id: 'blank1', answers: ['first term'], hint: 'key concept' },
          { id: 'blank2', answers: ['second term'], hint: 'related idea' },
        ],
        config: {
          useWordBank: false,
          caseSensitive: false,
        },
        required: false,
      };
    default:
      return { id, type, order } as Activity;
  }
}

export default createDefaultActivity;
