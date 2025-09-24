package noteswebapplication.crypts.Controller;


import noteswebapplication.crypts.dto.NoteRequest;
import noteswebapplication.crypts.Entity.Note;
import noteswebapplication.crypts.Repository.NoteRepository;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
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
    public ResponseEntity<Note> createNote(@Valid @RequestBody NoteRequest request) {
        Note note = new Note();
        note.setTitle(request.getTitle());
        note.setContent(request.getContent());

        Note saved = notes.save(note);

        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(saved.getId())
                .toUri();

        return ResponseEntity.created(location).body(saved);
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

     // Update
    @PutMapping("/{id}")
    public ResponseEntity<Note> updateNote(
            @PathVariable Long id,
            @Valid @RequestBody NoteRequest request) {
        return notes.findById(id)
                .map(existingNote -> {
                    existingNote.setTitle(request.getTitle());
                    existingNote.setContent(request.getContent());
                    Note updated = notes.save(existingNote);
                    return ResponseEntity.ok(updated);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Delete
    @DeleteMapping("/{id}")
    public ResponseEntity<Object> deleteNote(@PathVariable Long id) {
    return notes.findById(id)
            .map(note -> {
                notes.delete(note); 
                return ResponseEntity.noContent().build();
            })
            .orElseGet(() -> ResponseEntity.notFound().build());
}
}

