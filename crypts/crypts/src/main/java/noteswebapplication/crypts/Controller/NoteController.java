package noteswebapplication.crypts.Controller;


import noteswebapplication.crypts.dto.NoteRequest;
import noteswebapplication.crypts.Entity.Note;
import noteswebapplication.crypts.Repository.NoteRepository;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/notes")
public class NoteController {

    private final NoteRepository notes;

    public NoteController(NoteRepository notes) {
        this.notes = notes;
    }

    // Create
    @PostMapping
    @Transactional
    public ResponseEntity<Note> createNote(@Valid @RequestBody NoteRequest request) {
        try {
            System.out.println("Creating note with request: " + request);
            System.out.println("Title: " + request.getTitle());
            System.out.println("Content: " + request.getContent());
            
            Note note = new Note();
            note.setTitle(request.getTitle() != null ? request.getTitle() : "Untitled");
            note.setContent(request.getContent() != null && !request.getContent().trim().isEmpty() ? request.getContent() : " ");
            note.setPinned(request.getPinned() != null ? request.getPinned() : false);

            System.out.println("Note object created: " + note);
            System.out.println("Attempting to save to database...");
            
            Note saved = notes.save(note);
            System.out.println("Note saved successfully with ID: " + saved.getId());

            URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                    .path("/{id}")
                    .buildAndExpand(saved.getId())
                    .toUri();

            return ResponseEntity.created(location).body(saved);
        } catch (Exception e) {
            System.err.println("Error creating note: " + e.getClass().getSimpleName() + " - " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    // Read all
    @GetMapping
    public List<Note> getAllNotes() {
        return notes.findAll();
    }

    // Read one
    @GetMapping("/{id}")
    public ResponseEntity<Note> getNoteById(@PathVariable Long id) {
        return notes.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<Note> updateNote(
            @PathVariable Long id,
            @Valid @RequestBody NoteRequest request) {
        return notes.findById(id)
                .map(existingNote -> {
                    existingNote.setTitle(request.getTitle() != null ? request.getTitle() : "Untitled");
                    existingNote.setContent(request.getContent() != null && !request.getContent().trim().isEmpty() ? request.getContent() : " ");
                    if (request.getPinned() != null) {
                        existingNote.setPinned(request.getPinned());
                    }
                    Note updated = notes.save(existingNote);
                    return ResponseEntity.ok(updated);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Object> deleteNote(@PathVariable Long id) {
    return notes.findById(id)
            .map(note -> {
                notes.delete(note); 
                return ResponseEntity.noContent().build();
            })
            .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Health check endpoint
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Backend is running!");
    }

    // Database test endpoint
    @GetMapping("/test-db")
    public ResponseEntity<String> testDatabase() {
        try {
            long count = notes.count();
            return ResponseEntity.ok("Database connection OK. Notes count: " + count);
        } catch (Exception e) {
            System.err.println("Database test error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Database error: " + e.getMessage());
        }
    }

    // Simple test endpoint
    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("Controller is working!");
    }
}

