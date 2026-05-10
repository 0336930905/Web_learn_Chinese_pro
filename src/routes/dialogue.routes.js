/**
 * Dialogue Routes
 * Handles dialogue folders and practice dialogues
 */

const { dialogueController } = require('../controllers');
const { verifyToken } = require('../middleware');

const dialogueRoutes = (router, db) => {
  router.use((req, res, next) => {
    req.db = db;
    next();
  });

  // Dialogue Folders
  router.get('/dialogue-folders', verifyToken, dialogueController.getDialogueFolders);
  router.post('/dialogue-folders', verifyToken, dialogueController.createDialogueFolder);
  router.patch('/dialogue-folders/:id', verifyToken, dialogueController.updateDialogueFolder);
  router.delete('/dialogue-folders/:id', verifyToken, dialogueController.deleteDialogueFolder);

  // Dialogues
  router.get('/dialogues', verifyToken, dialogueController.getDialogues);
  router.post('/dialogues', verifyToken, dialogueController.createDialogue);
  router.patch('/dialogues/:id', verifyToken, dialogueController.updateDialogue);
  router.delete('/dialogues/:id', verifyToken, dialogueController.deleteDialogue);

  // Dialogue Sessions (practice history)
  router.get('/dialogue-sessions', verifyToken, dialogueController.getDialogueSessions);

  return router;
};

module.exports = dialogueRoutes;
