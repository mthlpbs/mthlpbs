#### 👷 The latest repos i've pushed to
{{range recentContributions 8}}
- [`{{.Repo.Name}}`]({{.Repo.URL}}) - _"{{.Repo.Description}}"_ **({{humanize .OccurredAt}})**
{{- end}}

#### ⌨️ My latest projects
{{range recentCreatedRepos "mthlpbs" 4}}
- [`{{.Name}}`]({{.URL}}) - _"{{.Description}}"_
{{- end}}

#### 📡 my [_`hackatime`_](https://waka.hackclub.com) stats from the last week

```text
{{ wakatimeDoubleCategoryBar "💾 Languages:" wakatimeData.Languages "💼 Projects:" wakatimeData.Projects 5 }}

Total: {{ wakatimeData.HumanReadableTotal }}
```


---

<!-- contact section -->
<div align="right">
  <h5>
    &nbsp; Contact &nbsp;&nbsp;:&nbsp;&nbsp;
    <a href="mailto:100818591+mthlpbs@users.noreply.github.com" target="_blank">
      <img align="center" src="https://www.svgrepo.com/show/381000/new-logo-gmail.svg" alt="Mail" height="20"/>
    </a>
    &nbsp;
    <!--
    <a href="https://linkedin.com/in/mithilaprabashwara" target="_blank">
      <img align="center" src="https://www.svgrepo.com/show/475661/linkedin-color.svg" alt="LinkedIn" height="16"/>
    </a>
    -->
    &nbsp; Github Accounts &nbsp;&nbsp;:&nbsp;&nbsp;
    <a href="https://github.com/mthlpbs" target="_blank">
      <img align="center" src="https://www.svgrepo.com/show/450156/github.svg" alt="GitHub" height="20"/>
    </a>
    <a href="https://github.com/asurpbs" target="_blank">
      <img align="center" src="https://www.svgrepo.com/show/450156/github.svg" alt="GitHub" height="20"/>
    </a>
    &nbsp; Others &nbsp;&nbsp;:&nbsp;&nbsp;
    <a href="https://openuserjs.org/users/asurpbs" target="_blank">
      <img align="center" src="https://openuserjs.org/images/favicon.ico" alt="OpenUserJS" height="20"/>
    </a>
    &nbsp;
    <a href="https://stackoverflow.com/users/19565278/mthlpbs" target="_blank">
      <img align="center" src="https://www.svgrepo.com/show/475686/stackoverflow-color.svg" alt="Stack Overflow" height="20"/>
    </a>
  </h5>
</div>


---