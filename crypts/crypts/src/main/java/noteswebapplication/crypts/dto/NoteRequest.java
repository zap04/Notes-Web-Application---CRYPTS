package noteswebapplication.crypts.dto;


import jakarta.validation.constraints.NotBlank;

public class NoteRequest {

    private String title;

    @NotBlank(message = "content must not be blank")
    private String content;

    public NoteRequest() {}

    public NoteRequest(String title, String content) {
        this.title = title;
        this.content = content;
    }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
}
