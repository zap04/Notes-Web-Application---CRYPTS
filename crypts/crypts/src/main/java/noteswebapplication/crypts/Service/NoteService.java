package noteswebapplication.crypts.Service;


import noteswebapplication.crypts.dto.NoteRequest;
import noteswebapplication.crypts.Entity.Note;
import noteswebapplication.crypts.Repository.NoteRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class NoteService {

    private final NoteRepository noteRepository;

    public NoteService(NoteRepository noteRepository) {
        this.noteRepository = noteRepository;
    }

    // Create a new note
    public Note createNote(NoteRequest request) {
        Note note = new Note();
        note.setTitle(request.getTitle());
        note.setContent(request.getContent());
        note.setPinned(request.getPinned() != null ? request.getPinned() : false);
        return noteRepository.save(note);
    }

    // Get all notes
    public List<Note> getAllNotes() {
        return noteRepository.findAll();
    }

    // Get a single note by id
    public Optional<Note> getNoteById(Long id) {
        return noteRepository.findById(id);
    }

    // Update note
    public Optional<Note> updateNote(Long id, NoteRequest request) {
        return noteRepository.findById(id).map(note -> {
            if (request.getTitle() != null) {
                note.setTitle(request.getTitle());
            }
            if (request.getContent() != null) {
                note.setContent(request.getContent());
            }
            if (request.getPinned() != null) {
                note.setPinned(request.getPinned());
            }
            return noteRepository.save(note);
        });
    }

    // Delete note
    public boolean deleteNote(Long id) {
        if (noteRepository.existsById(id)) {
            noteRepository.deleteById(id);
            return true;
        }
        return false;
    }
}

